import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const isAuthenticated = async (req, res, next)=> {
    try {
        const {token} = req.cookies;
        console.log('token : ' + token);
        if(!token){
            return res.status(401).json({success: false, message: 'Please login to do this action'})
        }
        const decoded = jwt.verify(token, "kjbwdjahbdjabhwdjwhd");
        console.log('decoded : ' + decoded);
        req.user = await User.findById(decoded._id);
        next();
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error'});        
    }
}