import User from '../models/userModel.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {cloudinary} from '../config/cloundinary/cloudinary.js'
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';


const createUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    console.log("req.body", req.files);
    const profileImage = req.file;

    console.log(name, email, password, profileImage);

    if (!name || !email || !password || !profileImage) {
        res.send({ status: 400, message: "All Fields Are Required" });
        return next(createHttpError(400, "All Fields Are Required"));
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.send({ status: 400, message: "User Already Exists" });
            return next(createHttpError(400, "User Already Exists"));
        }

        const filePath = profileImage.path;
        let result;
        try {
            result=await cloudinary.uploader.upload(filePath, {
                folder: "users",
            }
            )
        } catch (error) {
            res.send({ status: 500, message: "Image Upload Failed" });
            return next(createHttpError(500, "Image Upload Failed"));
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        console.log("verificationToken", verificationToken);

        console.log("verificationToken", verificationToken);

        try {
            await sendEmail(email, "Verify Your Email", verificationToken);
        } catch (emailError) {
            console.error('Email Sending Error:', emailError);
            res.send({ status: 500, message: "Email Sending Failed" });
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
                    isVerified: false,
                });

                // const accessToken= jwt.sign({id:newUser._id},process.env.JWT_SECRET_ACCESS,{expiresIn:'2h'})
    // const refreshToken= jwt.sign({id:newUser._id},process.env.JWT_SECRET_REFRESH,{expiresIn:'1d'})
    // await newUser.updateOne({refreshToken})
    console.log(newUser._id)
    res.status(200).json({id:newUser._id});
    res.send({ status: 200, message: "User Created" });
            } catch (hashError) {
                console.error('User creation error:', hashError);
                res.send({ status: 500, message: "User Creation Failed" });
                return next(createHttpError(500, "User Creation Failed"));
            }
    } catch (error) {
        console.error('User creation error:', error);
        res.send({ status: 500, message: "User Creation Failed" });
        return next(createHttpError(500, "User Creation Failed"));
    }
};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            // return next(createHttpError(400, "User Does Not Exist"));
            res.send({ status: 400, message: "User Does Not Exist" });
            // res.status(400).json({ message: "User Does Not Exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return next(createHttpError(400, "Wrong Password"));
        }

        const accessToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_ACCESS, { expiresIn: '2h' });
        const refreshToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_REFRESH, { expiresIn: '1d' });

        await existingUser.updateOne({ refreshToken });

        res.status(200).json({ id: existingUser._id, name: existingUser.name, profileImage: existingUser.profileImage, accessToken, refreshToken, isLoggedIn: true, status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return next(createHttpError(500, "Login Failed"));
    }
};

export { createUser, loginUser };
