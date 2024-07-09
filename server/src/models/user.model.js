import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        max: 20,
        min: 5,
    },
    userName: {
        type: String,
        required: true,
        unique: [true, "This username already exists."],
        trim: true,
        max: 10,
        min: 5,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: [true, "Already registered."],
        trim: true,
    },
    designation: {
        type: String,
        enum: ["Manager", "Team Lead", "SD 2", "SD 1"],
        required: true
    },
    password: {
        type: String,
        required: true,
        max: 10,
        min: 5
    },
    avatarFile: {
        type: String,
        required: true
    },
    avatarId: {
        type: String,
        required: true
    }
}, {timestamps: true})

userSchema.pre("save", async function(next) {
    
    if ( !this.isModified("password") ) return next();

    this.password = await bcrypt.hash(this.password, 10)
    return next();

})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRY
        }    
    )
}

const User = mongoose.model("User", userSchema)

export { User }