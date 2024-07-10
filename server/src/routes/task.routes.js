import { Router } from "express"
import { createTask, updateTask, deleteTask, getTasks } from '../controllers/task.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const taskRouter = Router();

taskRouter.route("/create").post(verifyJWT, createTask)
taskRouter.route("/update-task/:taskId").patch(verifyJWT, updateTask)
taskRouter.route('/delete/:taskId').delete(verifyJWT, deleteTask)
taskRouter.route('/all-tasks/:userId').get(verifyJWT, getTasks)


export {taskRouter}