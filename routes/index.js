var express = require("express");
var router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userModel = require("./users");
const postModel = require("./posts");
const upload = require("./multer");

passport.use(new LocalStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts");
  console.log(user);
  res.render("profile" ,{user}) ;
});

router.get("/login", function (req, res, next) {
  res.render("login", {error: req.flash("error")});
});

router.get("/feed", function (req, res, next) {
  res.render("feed");
});

router.post("/upload",isLoggedIn, upload.single("file"), async function (req, res, next) {
  if (!req.file){
    return res.status(404).send("no files were given");
  }
  const user = await userModel.findOne({username: req.session.passport.user});
  const postdata = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  });
  user.posts.push(postdata._id);
  await user.save();
  res.redirect("/profile");
});



router.post("/register", async function (req, res, next) {
  try {
    console.log("Registration request body:", req.body);
    const userData = {
      username: req.body.username,
      email: req.body.email,
      fullName: req.body.fullname,
    };
    console.log("User data to register:", userData);

    const user = await new Promise((resolve, reject) => {
      userModel.register(userData, req.body.password, function (err, user) {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });

    // Ensure email is saved - register method sometimes doesn't save custom fields
    if (user) {
      // Always set email if provided in request
      if (req.body.email) {
        user.email = req.body.email;
        console.log("Setting email to:", req.body.email);
      }
      // Save the user to ensure all fields are persisted (Mongoose 8 uses promises)
      await user.save();
      console.log("User saved successfully. Email:", user.email);
      
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    return next(err);
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
 
module.exports = router;
