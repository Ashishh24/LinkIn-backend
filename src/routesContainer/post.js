const express = require("express");
const { userAuth } = require("../middlewares/user");
const Post = require("../models/post");
const postRouter = express.Router();
const userData = "firstName lastName profilePhoto email phone about skills";

postRouter.post("/post/create", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { content, media } = req.body;

    if (!content && (!media || media.length === 0)) {
      throw { statusCode: 400, message: "Post content or media is required" };
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
    const populatedPost = await Post.findById(newPost._id).populate(
      "userId",
      "firstName lastName profilePhoto"
    );

    res.json({ message: "Post added successfully", post: populatedPost });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

postRouter.patch("/post/:id", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { content, media } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      throw { statusCode: 404, message: "Post not found" };
    }

    // check ownership
    if (post.userId.toString() !== user._id.toString()) {
      throw { statusCode: 403, message: "Not authorized to update this post" };
    }

    // update fields if provided
    if (content !== undefined) post.content = content;
    if (media !== undefined) post.media = media;

    await post.save();
    await post.populate("userId", "firstName lastName profilePhoto");
    await post.populate("likes", "firstName lastName profilePhoto");
    await post.populate({
      path: "comments",
      populate: { path: "userId", select: "firstName lastName profilePhoto" },
    });

    res.json({ message: "Post updated successfully", post });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

postRouter.delete("/post/:id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw { statusCode: 404, message: "Post not found" };

    // Only the owner can delete their post
    if (post.userId.toString() !== req.user._id.toString()) {
      throw { statusCode: 403, message: "Not authorized to delete this post" };
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
});

postRouter.get("/post/all", userAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", userData)
      .populate("likes", userData)
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

postRouter.post("/post/:id/like", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw { statusCode: 404, message: "Post not found" };

    const userId = req.user._id;

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await post.populate("likes", "firstName lastName profilePhoto");
    res.json({ likes: post.likes, len: post.likes.length });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

postRouter.post("/post/:id/comment", userAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) throw { statusCode: 400, message: "Comment required" };

    const post = await Post.findById(req.params.id);
    if (!post) throw { statusCode: 404, message: "Post not found" };

    post.comments.push({ userId: req.user._id, text });
    await post.save();

    await post.populate("comments.userId", "firstName lastName profilePhoto");

    res.json({ comments: post.comments });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

postRouter.post(
  "/post/:postId/comment/:commentId/like",
  userAuth,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user._id;

      const post = await Post.findById(postId);
      if (!post) throw { statusCode: 404, message: "Post not found" };

      const comment = post.comments.id(commentId);
      if (!comment) throw { statusCode: 404, message: "Comment not found" };

      if (comment.likes.includes(userId)) {
        comment.likes.pull(userId);
      } else {
        comment.likes.push(userId);
      }

      await post.save();
      res.json({ likes: comment.likes.length });
    } catch (err) {
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  }
);

module.exports = postRouter;
