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
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;