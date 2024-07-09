import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"

import { loginUser, logout, updateDetails, changeUserPassword, registerUser, getUser, updateUserAvatar } from "../controllers/user.controller.js";


const userRouter = Router();

userRouter.route("/register").post( upload.single("avatar"), registerUser)


export { userRouter }