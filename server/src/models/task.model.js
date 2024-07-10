import mongoose from "mongoose"


const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status:{
        type: String,
        enum: ["To Do", "In progress", "In review", "Done" ],
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deadline: {
        type: String,
        required: true,
    }
}, {timestamps: true})

const Task = mongoose.model("Task", taskSchema)

export {Task}