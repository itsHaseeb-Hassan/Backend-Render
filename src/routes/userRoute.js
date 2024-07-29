import express from "express";
import { createUser, loginUser ,verifyEmail } from "../controllers/userController.js";
import upload from "../midelwares/profileMidelware.js";
const userRouter=express.Router()

userRouter.post('/register',upload.single('profileImage') ,createUser);
userRouter.post('/login',loginUser);
userRouter.get('/verify/:token', verifyEmail);

export default userRouter
