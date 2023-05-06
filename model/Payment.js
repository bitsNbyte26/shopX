const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        paymentId:{
            type:String,
            required :true
        },
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
                values: ["pending", "onHold", "Completed", "cancelled","delivered"],
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment",paymentSchema);
