import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const subject = "Verify your email";

const sendEmail = async (email, verificationToken) => {

    const url = `${process.env.BASE_URL}/users/verify/${verificationToken}`;
        console.log("url", url);
        let message = `Click on the link to verify your email: ${url}`;

    try {
        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"No Reply" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: subject || "Verify your email",
            text: message,
        });

        console.log("email sent successfully");
    } catch (error) {
        console.log("email not sent!");
        console.log(error);
        return error;
    }
};

export default sendEmail;
