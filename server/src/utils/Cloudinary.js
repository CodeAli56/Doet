import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv";


dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload( localFilePath, { resource_type:"auto" } )
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath)  // remove the temporary saved file.
        return null;
    }
}

const deleteFromCloudinary = async(fileId) => {
    try {
        const response = await cloudinary.uploader.destroy(fileId, {resource_type : "auto"})
        return response? true: false
    } catch (error) {
        return error?.message || "Error while deleting asset from cloudinary."
    }
}



export { uploadOnCloudinary, deleteFromCloudinary}