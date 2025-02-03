import express, {Router} from 'express';
import {body} from 'express-validator';
import * as userController from '../controllers/user.controller.js';
import * as authMiddleWare from '../middleware/auth.middleware.js'
const router = Router();

router.post('/register',
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    userController.createUserController);
router.post('/login',
    body('email').isEmail().withMessage("Email Must be valid"),
    body('password').isLength({min:3}).withMessage("password must be atleast 3 characters long"),
    userController.loginController);
router.get('/profile',authMiddleWare.authUser,userController.profileController);

router.get('/logout', authMiddleWare.authUser,userController.logoutController);

router.get('/all',authMiddleWare.authUser,userController.getAllUserController);

router.get('/curr-user',authMiddleWare.authUser,userController.getCuurUser);

export default router;