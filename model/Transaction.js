const mongoose = require("mongoose");

const transactionschema = new mongoose.Schema(
    {
        currency: {
            type: String,
            required: [true, "Please provide currency"],
        },
        amount: {
            type: Number,
            required: [true, "Please provide amount"],
        },
        razorpay: {
            id: String,
            entity: String,
            amount: Number,
            amount_due: Number,
            amount_paid: Number,
            receipt: String,
            status: String,
            attempts: Number,
            notes: [],
            paymentId: String,
            singature: String,
        },
        paid: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "onHold", "completed", "cancelled","delivered"],
                message: "Please provide status value pending, onHold, completed, cancelled",
            },
            default: "pending",
        },
        Item:[{
            quantity:{
                type:Number
            },
            product:{
                type:mongoose.Types.ObjectId,
                ref:"product"
            }
        }],
        createdBy: {
            type: mongoose.Types.ObjectId,
            required: [true, "Please provide CreatedBy"],
            ref: "User",
        },
        createdAt: { type: Date, expires: "24h", default: Date.now },
    },
    { timestamps: true },
    
);

module.exports = mongoose.model("Transaction",transactionschema);
