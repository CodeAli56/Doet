import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTask = asyncHandler( async(req, res) => {
    
    const {title, description, assignedTo, deadline} = req.body;
    const assignedBy = req.user._id

    if( [title, description, assignedTo, deadline].some((field) => field?.trim() === "" )){
        throw new ApiError(400, "All fields are required.")
    }

    const assignedToUser = await User.findOne({userName: assignedTo})
    if( !assignedToUser){
        throw new ApiError(400, "No such employee exists.")
    }

    const task = await Task.create({
        title, 
        description, 
        assignedBy,
        assignedTo: assignedToUser._id,
        deadline,
        status : "To Do"
    })

    const newTask = await Task.findById(task._id)

    if (!task){
        throw new ApiError(500, "Something went wrong while creating task.")
    }
    
    return res.status(201)
    .json(new ApiResponse(201, newTask, "Successfully created task."))

})


const updateTask = asyncHandler( async(req, res) => {

    const { description, deadline, status, userName } = req.body;
    const { taskId } = req.params;
    console.log(taskId);
    if(!(description || deadline)){
        throw new ApiError(400, "Must send either description or deadline for updating details.")
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, {description, deadline, status, userName}, {new: true})
    if (!updatedTask){
        throw new ApiError(500, "Something went wrong while updating the details.")
    }

    return res.status(201)
    .json(new ApiResponse(201, updatedTask, "Successfully updated the task."))

})

const deleteTask = asyncHandler( async(req, res) => {

    const { taskId } = req.params;
    const deletedTask = await Task.findByIdAndDelete(taskId)
    if (!deletedTask){
        throw new ApiError(500, "Something went wrong while deleting this task.")
    }

    return res.status(201)
    .json(new ApiResponse(201, {}, "Successfully deleted task."))
    
})

const getTasks = asyncHandler( async(req, res) => {
   
    const { userId } = req.params;

    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(400, "No such user exists.")
    }

    const tasks = await Task.aggregate([
        {
            $match: {
                assignedTo: user._id
            }
        }
    ])
    
    if ( !(tasks || Array.isArray(tasks)) ){
        throw new ApiError(400, "Either no task assigned to him or something is wrong.")
    }

    return res.status(200)
    .json(new ApiResponse(200, tasks, "Successfully fetched all tasks for this user."))

})

export { createTask, getTasks, updateTask, deleteTask}