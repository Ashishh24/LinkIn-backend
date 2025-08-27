const express = require("express");
const { userAuth } = require("../middlewares/user");
const Post = require("../models/post");
const postRouter = express.Router();

postRouter.post("/post/create", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { content, media } = req.body;

    if (!content && (!media || media.length === 0)) {
      return res
        .status(400)
        .json({ message: "Post content or media is required" });
    }
    // ✅ Validate media array if provided
    let formattedMedia = [];
    if (media && media.length > 0) {
      formattedMedia = media.map((m) => ({
        url: m.url,
        type: m.type,
      }));
    }

    const newPost = new Post({
      userId: user._id,
      content,
      media: formattedMedia,
    });

    await newPost.save();

    res.json({ message: "Post added successfully", post: newPost });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

postRouter.get("/post/all", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const posts = await Post.find({
      userId: { $ne: user._id },
    });

    res.json({ posts });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

module.exports = postRouter;
