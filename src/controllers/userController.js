import User from '../models/userModel.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {cloudinary} from '../config/cloundinary/cloudinary.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';


dotenv.config();
const createUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    const profileImage = req.file;

    console.log("Received input:", name, email, password, profileImage);

    if (!name || !email || !password || !profileImage) {
        return next(createHttpError(400, "All Fields Are Required"));
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(createHttpError(400, "User Already Exists"));
        }

        const filePath = profileImage.path;
        let result;
        try {
            result = await cloudinary.uploader.upload(filePath, {
                folder: "users",
            });
        } catch (error) {
            console.error('Image Upload Error:', error);
            return next(createHttpError(500, "Image Upload Failed"));
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        console.log("verificationToken", verificationToken);

        console.log("verificationToken", verificationToken );

        try {
            await sendEmail(email, verificationToken);
            console.log("Email sent successfully");
        } catch (emailError) {
            console.error('Email Sending Error:', emailError);
            return next(createHttpError(500, "Email Sending Failed"));
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
                profileImage: result.secure_url,
                verificationToken,
                isVerified: false
            });

            console.log("New user created successfully:", newUser);

            res.status(200).json({ id: newUser._id });
        } catch (hashError) {
            console.error('User Creation Error:', hashError);
            return next(createHttpError(500, "User Creation Failed"));
        }
    } catch (error) {
        console.error('User Creation Error:', error);
        return next(createHttpError(500, "User Creation Failed"));
    }
};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "User Does Not Exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return next(createHttpError(400, "Wrong Password"));
        }

        const accessToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_ACCESS, { expiresIn: '2h' });
        const refreshToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_REFRESH, { expiresIn: '1d' });

        await existingUser.updateOne({ refreshToken });

        res.status(200).json({ id: existingUser._id, name: existingUser.name, profileImage: existingUser.profileImage, accessToken, refreshToken, isLoggedIn: true, isVerified: existingUser.isVerified, status: 200 });
    } catch (error) {
        console.error('Login Error:', error);
        return next(createHttpError(500, "Login Failed"));
    }
};
 const verifyEmail = async (req, res) => {
    try {
        const token = req.params.token;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid token');
        }

        user.isVerified = true;
        user.verificationToken = token; // Clear the token after verification
        await user.save();

        res.render('verified'); // Render your EJS page (or use res.sendFile for HTML)
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

export { createUser, loginUser, verifyEmail };
