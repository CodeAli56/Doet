import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js"


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

    const {fullName, designation} = req.body;
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401, "Unauthorized request.")
    }
    const updatedUser = await User.findByIdAndUpdate(userId, {fullName, designation}, {new: true}).select("-password")
    if( !updatedUser){
        throw new ApiError(500, "Something went wrong while updating details")
    }

    return res.status(201)
    .json(new ApiResponse(201, updatedUser, "Successfully updated details."))
})

const logout = asyncHandler( async(req, res)=> {
    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Successfully logged out."))
})

const getUser = asyncHandler( async(req, res)=> {
    const {userId} = req.params;
    const user = await User.findById(userId).select("-password")
    if(!user){
        throw new ApiError(400, "Bad request, no such user exist.")
    }

    return res.status(200)
    .json(new ApiResponse(200, user, "Successfully fetched details"))
})

const updateUserAvatar = asyncHandler( async(req, res)=> {
    
    const {userId} = req.params;
    const avatarLocalPath = req.file?.path;
    
    const user = await User.findById(userId)

    const deletedAsset = await deleteFromCloudinary(user.avatarId)
    if(!deletedAsset){
        throw new ApiError(500, "Failed during deleting asset from cloudinary.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(500, "Something went wrong while uploading avatar on cloudinary.")
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {avatarFile: avatar.url , avatarId: avatar.public_id}, {new: true}).select("-password")
    if(!updatedUser){
        throw new ApiError(500, "Something went wrong while updating avatar.")
    }

    return res.status(200)
    .json(new ApiResponse(200, updatedUser, "Successfully updated avatar."))
})

const changeUserPassword = asyncHandler( async(req, res)=> {
    
    const { password } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId)
    user.password = password;
    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(new ApiResponse(200, user, "Password updated."))

})

export { loginUser, registerUser, changeUserPassword, updateDetails, logout, updateUserAvatar, getUser}