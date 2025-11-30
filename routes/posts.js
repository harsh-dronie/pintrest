const mongoose = require('mongoose');

if (mongoose.connection.readyState === 0) {
  mongoose.connect("mongodb://localhost:27017/fetchpost")
    .then(() => console.log('MongoDB connected (posts)'))
    .catch(err => console.error('MongoDB connection error:', err));
}

const postSchema = new mongoose.Schema({
  imageText: {
    type: String,
    required: true,
  },

  image:{
    type: String,

  },

  user: {
    type : mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  date: {
    type: Date,
    default: Date.now  
  },

  time: {
    type: String,
    default: () => new Date().toLocaleTimeString()  // e.g. "10:42:15 AM"
  },

  likes: {
    type: Array,
    default: [],
  }
});

// Check if model already exists, if not create it
const PostModel = mongoose.models.Post || mongoose.model('Post', postSchema);

module.exports = PostModel;
