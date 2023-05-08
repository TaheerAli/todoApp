import {User} from '../models/user.js';
import { sendMail } from '../utils/sendMail.js';
import { sendToken } from '../utils/sendToken.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

export const register = async (req, res)=> {
    try {
        const {name, email, password} = req.body;
        const avatar = req.files.avatar.tempFilePath;
        console.log('avatar path : '+ avatar);
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({success: false, message: 'User already exists !'});
        }
        //const myCloud = await cloudinary.v2.uploader.upload(avatar);
        //fs.rmSync('tmp', {recursive: true});
        const otp = Math.floor((Math.random() * 100000));
        const imageId = Date.now() + Math.floor((Math.random() * 100000));
        user = await User.create({name, email, password, avatar: {public_id: imageId, url: avatar}, otp, otpExpiry: new Date(Date.now() + 5*60*1000)});
        //await sendMail(email, 'taha todoapp otp', 'Your OTP is : ${otp}');
        sendToken(res, user, 201, 'OTP sent to your account, please verify your account');
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const verify = async (req, res)=> {
    try {
        const inputOtp = Number(req.body.otp);
        const user = await User.findById(req.user._id);

        if(!inputOtp || (inputOtp !== user.otp) || (user.otpExpiry < Date.now())){
            return res.status(401).json({success: false, message: 'Invalid OTP'})
        }
        user.verified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        sendToken(res, user, 200, 'Successfully Verified');
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const login = async (req, res)=> {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({success: false, message: 'email or password incorrect'});
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({success: false, message: 'email or password incorrect'})
        }
        sendToken(res, user, 200, 'Login successful');
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const logout = async (req, res)=> {
    try {
        res.status(200).cookie("token", null, {"expires": new Date(Date.now())}).json({success: true, message: 'Logout successful'});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const addTask = async (req, res)=> {
    try {
        const {title, description} = req.body;
        const user = await User.findById(req.user._id);
        user.tasks.push({title, description, completed: false, createdAt: new Date(Date.now())});
        await user.save();
        res.status(200).json({success: true, message: 'Task added successfully'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const removeTask = async (req, res)=> {
    try {
        const {taskId} = req.params;
        const user = await User.findById(req.user._id);
        user.tasks = user.tasks.filter((task)=> {
            return task._id.toString() !== taskId.toString();
        })
        await user.save();
        res.status(200).json({success: true, message: 'Task removed successfully'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const updateTask = async (req, res)=> {
    try {
        const {taskId} = req.params;
        const user = await User.findById(req.user._id);
        user.tasks.find((task) => {
            return task._id.toString() === taskId.toString();
        }).completed = true;
        await user.save();
        res.status(200).json({success: true, message: 'Task updated successfully'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const profile = async (req, res)=> {
    try {
        const user = await User.findById(req.user._id);
        sendToken(res, user, 201, `Welcome back ${user.name}`);
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const updateProfile = async (req, res)=> {
    try {
        const user = await User.findById(req.user._id);
        const {name} = req.body;
        const avatar = req.files.avatar.tempFilePath;
        if(name) user.name = name;
        if(avatar){
            fs.unlinkSync(user.avatar.url);
            const imageId = Date.now() + Math.floor((Math.random() * 100000));
            user.avatar = {
                public_id: imageId,
                url: avatar
            }
        }
        await user.save();
        res.status(200).json({success: true, message: 'Profile updated successfully'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const updatePassword = async (req, res)=> {
    try {
        const user = await User.findById(req.user._id).select("+password");
        const {oldPassword, newPassword} = req.body;
        const isMatch = await user.comparePassword(oldPassword);
        if(!isMatch){
            return res.status(400).json({success: false, message: 'incorrect password'});
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({success: true, message: 'Password updated successfully'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const forgotPassword = async (req, res)=> {
    try {
        const {email} = req.body;
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: 'User not found!'});
        }
        const otp = Math.floor((Math.random() * 100000));
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpiry = new Date(Date.now() + 5*60*1000);
        await user.save();
        //await sendMail(email, 'taha todoapp otp', 'Your OTP is : ${otp}');
        res.status(200).json({success: true, message: `OTP sent to ${email}, please reset your password by using link sent in email`});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const resetPassword = async (req, res)=> {
    try {
        const { email, otp, newPassword } = req.body;
        let user = await User.findOne({
            email: email,
            resetPasswordOtp: otp,
            resetPasswordOtpExpiry: {$gt: Date.now()}
        });
        if(!user){
            return res.status(400).json({success: false, message: 'Invalid otp or otp has expired'});
        }
        user.password = newPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpiry = null;
        await user.save();
        //sendToken(res, user, 200, 'Password changed successfully');
        res.status(200).json({success: true, message: 'Password reset successfully'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}