import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"


const registerUser = asyncHandler( async(req, res) => {
    const {fullName, userName, email, password, designation} = req.body;

    if( [fullName, userName, email, password, designation].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required.")
    }

    const existedUser = await User.find({ $or: [userName, email] })
    if ( !existedUser){
        throw new ApiError(400, "User already registered with this email or username.")
    }

    const avatarLocalPath = req.files?.avatar.path
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar){
        throw new ApiError(500, "Something went wrong while uploading avatar on cloudinary.")
    }

    const user = await User.create({
        fullName, 
        userName, 
        email,
        password,
        designation,
        avatar: avatar.url,
        avatarId: avatar.public_id
    })

    const createdUser = await User.findById(user._id).select("-password")
    if ( !createdUser){
        throw new ApiError(500, "Something went wrong while creating new user.")
    }

    return res.status(201)
    .json(new ApiResponse(201, createdUser, "Successfully user created."))
    
})

const loginUser = asyncHandler( (req, res)=> {

})

const updateDetails = asyncHandler( (req, res)=> {

})

const logout = asyncHandler( (req, res)=> {

})

const getUser = asyncHandler( (req, res)=> {

})

const updateUserAvatar = asyncHandler( (req, res)=> {

})

const changeUserPassword = asyncHandler( (req, res)=> {

})

export { loginUser, registerUser, changeUserPassword, updateDetails, logout, updateUserAvatar, getUser}