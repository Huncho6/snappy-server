const express = require("express");
const dotenv = require("dotenv");
const { storage } = require("./storage/storage");
const multer = require("multer");
const upload = multer({ storage });
const cors = require("cors");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Post = require("./model/postModel");
const authRoute = require("./auth/authRoute");
const db = require("./db");

const { verifyToken, isUser } = require("./auth/authMiddleware");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected to database"));

app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file);

  res.status(200).send({
    status: "success",
    message: "Image uploaded successfully",
    url: req.file.path,
  });
});

app.post("/create-post", async (req, res) => {
  const body = req.body;
  try {
    const post = new Post(body);
    await post.save();
    res.status(200).send({
      status: "success",
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "Error creating post",
      error: error,
    });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).send({
      count: posts.length,
      status: "success",
      message: "Posts retrieved successfully",
      data: posts,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "Error retrieving posts",
      error: error,
    });
  }
});

app.get("/post/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).send({
      status: "success",
      message: "Post retrieved successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "Error retrieving post",
      error: error,
    });
  }
});

app.put("/posts/:id/like", async (req, res) => {
  try {
    const postId = req.params.id;
    // console.log("Post ID received:", postId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).send({
        status: "error",
        message: "Invalid post ID",
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } }, // Increment the likes by 1
      { new: true } // Return the updated document
    );

    if (!post) {
      return res.status(404).send({
        status: "error",
        message: "Post not found",
      });
    }

    res.status(200).send({
      status: "success",
      message: "Post liked successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).send({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.delete("/post/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await Post.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "post not found" });
    }

    res.status(200).json({ message: "post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.use("/", authRoute);
app.use("/", verifyToken, isUser, authRoute);
