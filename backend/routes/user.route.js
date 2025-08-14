import express from "express";
import {
  editProfile,
  followorUnfollow,
  getProfile,
  getSuggestedUsers,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";

import isAutheticated from "../middlewares/isAutheticated.js";
import upload from "../middlewares/multer.js";
const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/logout").get(logout);
userRouter.route("/:id/profile").post(isAutheticated, getProfile);
userRouter
  .route("/profile/edit")
  .post(isAutheticated, upload.single("profilePicture"), editProfile);
userRouter.route("/suggested").get(isAutheticated, getSuggestedUsers);
userRouter.route("/followOrUnfollw/:id").post(isAutheticated, followorUnfollow);

export default userRouter;
