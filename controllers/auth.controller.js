const crypto = require("crypto")
const bcrypt = require('bcryptjs')
const express = require("express");
const otpGenrator = require('otp-generator')
const jwt = require("jsonwebtoken");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Otp = require("../model/Otp");
const User = require("../model/user")
const Email = require("../utils/sendgrid");
const asyncWrapper = require("../utils/asyncWrapper");

function generateJWT(user){
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
}
const refreshToken= async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        const message = "Unauthenticaded No Bearer";
        return next(createCustomError(message, 401));
    }

    let data;
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        data = await getNewToken(payload);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const payload = jwt.decode(token, { complete: true }).payload;
            data = await getNewToken(payload);

            if (!data) {
                const message = "Authentication failed invalid JWT";
                return next(createCustomError(message, 401));
            }
        } else {
            const message = "Authentication failed invalid JWT";
            return next(createCustomError(message, 401));
        }
    }

    res.status(200).json(sendSuccessApiResponse(data, 200));
};

generateJWT = function (user) {
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
};
const setPassword = asyncWrapper(async (req,res,next)=>{
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, 12);
    const user = await User.findOne({ email, isActive: true , isVerified:true });
    if (!user) {
        const message = `No user found with the email: ${email}`;
        return next(createCustomError(message, 400));
    }
    user.password = password
    await user.save();
    const data = {user,token: generateJWT(user)}    
    const response = sendSuccessApiResponse(data);
    res.status(201).json(response);
})
const registerUser = async (req, res, next) => {
    try{
        const {
            Name,
            email,
            password,
            phoneNumber,
            gender,
            role,
        } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const toStore = {
            Name,
            email,
            password:hashedPassword,
            phoneNumber,
            gender,
            role,
        };
        console.log("register");
        const emailisActive = await User.findOne({ email, isActive: true , isVerified:true});
        if (emailisActive) {
            const message = "Email is already registered";
            return next(createCustomError(message, 406));
        }
        const OTPgen = otpGenrator.generate(5,{
            digits:true, lowerCaseAlphabets : false, upperCaseAlphabets:false,
            specialChars:false
        })
        const OTP = await Otp.updateOne({email:email},{email:email , otp:OTPgen},{upsert:true});
        Email.sendEmail(email,OTPgen);
        const notVerifiedUser = await User.find({email:email});
        console.log(notVerifiedUser);
        if(notVerifiedUser.length){
            console.log(notVerifiedUser);
            res.json(sendSuccessApiResponse(notVerifiedUser,200));
        }
        else{
            const user = await User.create(toStore);
            console.log(user);
            const response = sendSuccessApiResponse(user)
            console.log(response)
            res.json(response);
        }
    }
    catch(err){
        return createCustomError(err,400);
    }
};

const loginUser = async (req, res, next) => {
    try{
        const { email, password } = req.body;
        console.log("login");
        const emailExists = await User.findOne({ email:email, isActive: true , isVerified:true},
            "Name email username password role"
        );
        if (!emailExists) {
            const message = "User Not Found";
            return next(createCustomError(message, 404));
        }   
    
        const isPasswordRight = await bcrypt.compare(password, emailExists.password);
        if (!isPasswordRight) {
            const message = "Invalid credentials";
            return next(createCustomError(message, 401));
        }
        const data = {
            Name: emailExists.Name,
            email: emailExists.email,
            token: generateJWT(emailExists),
            role:emailExists.role
        };
        res.status(200).json(sendSuccessApiResponse(data));
    }
    catch(err){
        return createCustomError(err,400);
    }
};

const forgotPassword = async (req, res, next) => {
    try{
        const { email } = req.body;
        const user = await User.findOne({ email, isActive: true , isVerified:true });
        if (!user) {
            const message = `No user found with the email: ${email}`;
            return next(createCustomError(message, 400));
        }
        const OTPgen = otpGenrator.generate(5,{
            digits:true, lowerCaseAlphabets : false, upperCaseAlphabets:false,
            specialChars:false
        })
        const OTP = await Otp.updateOne({email:email},{email:email , otp:OTPgen},{upsert:true});
        Email.sendEmail(email,OTPgen);
        res.status(200).json('OTP send')
    }
    catch(err){
        return createCustomError(err,400);

    }
};
const resendOTP = asyncWrapper(async (req,res,next)=>{
    const email = req.body.email;
    const user = await User.findOne({ email, isActive: true , isVerified:true });
    if (user) {
        const message = `user is already with the email: ${email}`;
        return next(createCustomError(message, 400));
    }
    const OTPgen = otpGenrator.generate(5,{
        digits:true, lowerCaseAlphabets : false, upperCaseAlphabets:false,
        specialChars:false
    })
    const OTP = await Otp.updateOne({email:email},{email:email , otp:OTPgen},{upsert:true});
    Email.sendEmail(email,OTPgen);
    res.status(200).json('OTP resend')
})
const otpValid = async (req, res, next) => {
    try{
        const {otp,email} = req.body;
        console.log(otp);
        const verify = await Otp.findOne({email:email,otp:otp});
        console.log(verify);
        if(!verify){
            const message = "Invalid token or Token expired";
            return res.json(createCustomError(message,404));
        }
        const user = await User.findOneAndUpdate({email:email},{isVerified:true});
        const data = {user,token: generateJWT(user)}    
        console.log(data)
        const response = sendSuccessApiResponse(data);
        res.status(200).json(response);
    }
    catch(err){
        return createCustomError(err,400);
    }
};

// const EmailActivationLink = asyncWrapper(async (req,res,next)=>{
//     const id = req.body.id;
//     const email = req.body.email
//     const isUser = await User.findById(id);
//     const token = jwt.sign({email:email,userId:id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRATION})
//     // const token = isUser.generateJWT()
//     const resetURL = `${req.protocol}://${process.env.URL}/api/v1/auth/activate-email/${token}`;
//     const message = `Click on below link to verify this email \n ${resetURL}`;
//     await sendEmail({
//         email: email,
//         subject: "Your email activation link (Valid for 10 minutes)",
//         message,
//     });
//     const response = sendSuccessApiResponse(resetURL);
//     res.status(200).json(response)
// })
// const activateEmail = asyncWrapper(async (req,res,next)=>{
//     const token = req.params.token;
//     const payload =await jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({ isActive: true, _id: payload.userId ,isVerified:true});
//     if (!user) {
//         return next(createCustomError("Invalid Token"));
//     }
//     user.email = payload.email;
//     await user.save();
//     const response = sendSuccessApiResponse(user);
//     res.status(200).json(response)
// })
// const updatePassword = async (req, res, next) => {
//     try{
//         const { currentPassword, newPassword } = req.body;
//         const id = req.body.id;
//         console.log(id)
//         const user = await User.findOne({_id: id,isActive:true ,isVerified:true});
//         if (!user) {
//             const message = "There was an error finding the email";
//             return next(createCustomError(message, 401));
//         }
    
//         const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
//         if (!isCurrentPasswordCorrect) {
//             const message = "Invalid current password";
//             return next(createCustomError(message, 400));
//         }
    
//         user.password = newPassword;
//         await user.save();
    
//         const data = { updatedPassword: true, email: user.email };
//         const response = sendSuccessApiResponse(data);
//         res.status(200).json(response);
//     }
//     catch(err){
//         return createCustomError(err,400);
//     }
// };



module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    otpValid,
    refreshToken,
    setPassword,
    resendOTP
};
