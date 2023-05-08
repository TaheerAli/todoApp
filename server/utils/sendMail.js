import { text } from 'express';
import {createTransport} from 'nodemailer';

export const sendMail = async (email, subject, text) => {
    const transport = createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'nodemailermail606@gmail.com',
            pass: 'passwordForAbhi'
        }
    });
    
    await transport.sendMail({
        from: 'nodemailermail606@gmail.com',
        to: email,
        subject,
        text
    });
}

