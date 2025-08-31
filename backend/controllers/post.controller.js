import sharp from "sharp";
import cloudinary from "../utils/cloudinary";
import Post from "../models/post.model.js";
import { User } from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import { response } from "express";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({
        message: "image required",
        success: false,
      });
    }

    //image upload
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",
      })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    //bufffer to dataUri
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "Post created succesfully",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username , profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username,profilePicture",
        },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username , profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username,profilePicture",
        },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  try {
    const likeKarneWala = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({
        message: "no post found ",
        success: false,
      });
    }

    //like logic started
    await Post.updateOne({ $addToSet: { likes: likeKarneWala } });
    await post.save();

    //implement socket io for real time notification

    return res.status(200).json({
      message: "Post liked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
export const disLikePost = async (req, res) => {
  try {
    const likeKarneWala = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({
        message: "no post found ",
        success: false,
      });
    }

    //like logic started
    await Post.updateOne({ $pull: { likes: likeKarneWala } });
    await post.save();

    //implement socket io for real time notification

    return res.status(200).json({
      message: "Post disliked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentUser = req.id;

    const { text } = req.body;
    const post = await Post.findById(postId);

    if (!text)
      return res.status(400).json({
        message: "text is required",
        success: false,
      });

    const comment = await Comment.create({
      text,
      author: commentUser,
      post: postId,
    }).populate({
      path: "author",
      select: "username, profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "comment added",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
