import express from 'express';
import { addTask, forgotPassword, login, logout, profile, register, removeTask, resetPassword, updatePassword, updateProfile, updateTask, verify } from '../controller/user.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/verify').post(isAuthenticated, verify);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/addTask').post(isAuthenticated, addTask);
router.route('/task/:taskId').get(isAuthenticated, updateTask).delete(isAuthenticated, removeTask);
router.route('/profile').get(isAuthenticated, profile);
router.route('/updateProfile').put(isAuthenticated, updateProfile);
router.route('/updatePassword').put(isAuthenticated, updatePassword);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword').post(resetPassword);

export default router;