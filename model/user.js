const bcrypt =  require("bcryptjs");
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose")
const schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
    {
        Name: {
            type: String,
            required: [true, "Please provide Name"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please provide email"],
            match: [
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
                "Please provide valid email",
            ],
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Please provide password"],
        },
        phoneNumber: {
            type: String,
            required: [true, "Please provide phone number"],
            trim: true,
        },
        // gender: {
        //     type: String,
        //     required: [true, "Please provide gender"],
        //     enum: {
        //         values: ["Male", "Female", "Others"],
        //         message: "Please choose from Male, Female or Others",
        //     },
        // },
        location:{
            type:String
        },
        wishlist:[{
            type:schema.Types.ObjectId,
            ref:"product"
        }],
        role: {
            type:String,
            enum :{
                values: ["User", "Admin"],
                message: "Please select User or Admin",
            },
            default:"User"
        },
        isVerified: {
            type:Boolean,
            default:false
        },
        avatar: {
            type: String,
            trim: true,
        },
        cart:[{
            quantity:{
                type:Number,
                default:0
            },
            product:{
                type:schema.Types.ObjectId,
                ref:"product"
            }
        }],
        orderhistory:[{
            type:schema.Types.ObjectId,
            ref:"Payment"
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);


module.exports =  mongoose.model("User", userSchema, "user");
