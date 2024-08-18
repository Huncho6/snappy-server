const mongoose = require("mongoose");

const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    postDescription: {
      type: String,
      required: true,
    },
    postImage: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0, // Set default value to 0
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
