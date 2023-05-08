import jwt from "jsonwebtoken";

export const sendToken = (res, user, statusCode, message)=> {

    // const token = user.getJWTToken();

    const token = jwt.sign({_id: user._id}, 'kjbwdjahbdjabhwdjwhd', {
        expiresIn: 5*60*1000
    })

    console.log('token generated: ' + token);

    const userData = {
        _id: user._id,
        name: user.email,
        email: user.email,
        avatar: user.avatar,
        tasks: user.tasks
    }

    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + (5*60*1000))
    }
    res.status(statusCode).cookie('token', token, options).json({success: true, message, userData});
}