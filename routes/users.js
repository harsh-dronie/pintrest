const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose.connect("mongodb://localhost:27017/fetchpost")
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    unique: true,
    sparse: true,
  },

  fullName: {
    type: String,
    required: true,
  },

  dp: {
    type: String, // URL of display picture
    default: ""
  },

  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

userSchema.plugin(plm, {
  usernameField: 'username',
  usernameUnique: true
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
