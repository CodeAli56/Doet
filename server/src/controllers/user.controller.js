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

    const existedUser = await User.findOne({ $or: [ {userName}, {email} ] })
    if (existedUser){
        throw new ApiError(400, "User already registered with this email or username.")
    }

    const avatarLocalPath = req.file?.path
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
        avatarFile: avatar.url,
        avatarId: avatar.public_id
    })

    const createdUser = await User.findById(user._id).select("-password")
    if ( !createdUser){
        throw new ApiError(500, "Something went wrong while creating new user.")
    }

    return res.status(201)
    .json(new ApiResponse(201, createdUser, "Successfully user created."))
    
})

const loginUser = asyncHandler( async(req, res) => {
    const { email, userName, password } = req.body;

    if(!( (email || userName) && password) ){
        throw new ApiError(400, "Both fields are required.")
    }

    const user = await User.findOne({$or: [ {userName}, {email} ]})
    if(!user){
        throw new ApiError(400, "Invalid email or username.")
    }

    const isValidPassword = await user.isPasswordCorrect(password)
    if(!isValidPassword){
        throw new ApiError(400, "Incorrect Password, Please try again.")
    }

    const accessToken = await user.generateAccessToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password")

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, loggedInUser, "Successfully logged in."))

})

const updateDetails = asyncHandler( async(req, res)=> {
        
})

const logout = asyncHandler( async(req, res)=> {

})

const getUser = asyncHandler( async(req, res)=> {

})

const updateUserAvatar = asyncHandler( async(req, res)=> {

})

const changeUserPassword = asyncHandler( async(req, res)=> {

})

export { loginUser, registerUser, changeUserPassword, updateDetails, logout, updateUserAvatar, getUser}