import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required : true,
        minLength: [8, "Password must be atleast 8 characters long"],
        select: false
    },
    avatar: {
        public_id: String,
        url: String
    },
    tasks: [{
        title: String,
        description: String,
        createdAt: Date,
        completed: Boolean
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    otp: Number,
    otpExpiry: Date,
    verified: {
        type: Boolean,
        default: false
    },
    resetPasswordOtp: Number,
    resetPasswordOtpExpiry: Date
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.getJWTToken = function () {
    return jwt.sign({_id: this._id}, 'kjbwdjahbdjabhwdjwhd', {
        expiresIn: 5*60*1000
    })
}

userSchema.index({otpExpiry: 1}, {expireAfterSeconds: 0});

export const User = mongoose.model("User", userSchema);