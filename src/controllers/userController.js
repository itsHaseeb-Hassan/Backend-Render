import User from '../models/userModel.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {cloudinary} from '../config/cloundinary/cloudinary.js'


const createUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    console.log("req.body", req.files);
    const profileImage = req.file;

    console.log(name, email, password, profileImage);

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
            result=await cloudinary.uploader.upload(filePath, {
                folder: "users",
            }
            )
        } catch (error) {
            return next(createHttpError(500, "Image Upload Failed"));
        }

       

            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = await User.create({
                    name,
                    email,
                    password: hashedPassword,
                    profileImage: result.secure_url,
                });

                // const accessToken= jwt.sign({id:newUser._id},process.env.JWT_SECRET_ACCESS,{expiresIn:'2h'})
    // const refreshToken= jwt.sign({id:newUser._id},process.env.JWT_SECRET_REFRESH,{expiresIn:'1d'})
    // await newUser.updateOne({refreshToken})
    console.log(newUser._id)
    res.status(200).json({id:newUser._id});
            } catch (hashError) {
                console.error('User creation error:', hashError);
                return next(createHttpError(500, "User Creation Failed"));
            }
    } catch (error) {
        console.error('User creation error:', error);
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
