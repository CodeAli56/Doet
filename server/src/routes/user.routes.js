import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logout, updateDetails, changeUserPassword, registerUser, getUser, updateUserAvatar } from "../controllers/user.controller.js";


const userRouter = Router();

userRouter.route("/register").post( upload.single("avatar"), registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/update-details").patch(verifyJWT, updateDetails)
userRouter.route('/logout').post(verifyJWT, logout)
userRouter.route('/user/:userId').get(verifyJWT, getUser)
userRouter.route('/update-password/:userId').patch(verifyJWT, changeUserPassword)
userRouter.route("/update-avatar/:userId").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)


export { userRouter }