const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const jwt = require("jsonwebtoken");
const Payment = require("../model/Payment");
const Transaction = require("../model/Transaction");
const User = require("../model/user");
const Razorpay = require('razorpay');
const asyncWrapper = require("../utils/asyncWrapper");
const crypto = require('crypto');
const Product = require("../model/product");
const mongoose = require("mongoose");
const Email = require("../utils/sendgrid");

let instance = new Razorpay({
    key_id:process.env.key_id,
    key_secret:process.env.key_secret
})

const createOrder = asyncWrapper(async (req, res, next) => {
    const createdBy = req.user.userId;
    const order = req.body;

    let options = {
        amount: req.body.amount,
        currency:req.body.currency,
        receipt:"rcp1"
    }
    let paymentData = {
        currency:req.body.currency,
        amount: req.body.amount,
        createdBy: createdBy,
    };
    // await instance.orders.create(options,function (err,order){
    //     if(err){
    //         const message = "Cannot create Order";
    //         return next(createCustomError(message, 400));
    //     }
    //     paymentData = {
    //         currency:order.currency,
    //         amount: order.amount,
    //         razorpay: order,
    //         createdBy: createdBy,
    //     };
    // })
    const payment = await Transaction.create(paymentData);

    try{
        const user = await User.findById(req.user.userId);
        user.cart.forEach(element => {
            payment.Item.push(element);
        });
        await payment.save();
    }
    catch (error)
    {
        const message = `There was an Error: ${error}`;
        return next(createCustomError(message, 400));
    }

    const response = sendSuccessApiResponse(payment);
    res.status(200).json(response);
});


const verifyPayment = asyncWrapper(async (req, res, next) => {
    const createdBy = req.user.userId;
    const { id, razorpay_payment_id, razorpay_signature } = req.body;
    const Id = mongoose.Types.ObjectId(id);
    const payment = await Transaction.findById(Id);
    const orid = payment.razorpay.id;
    if (!payment) {
        const message = `Cannot find payment with id: ${id}`;
        return next(createCustomError(message, 400));
    }
    // let body = payment.razorpay.id + "|" + razorpay_payment_id;
    // const expectedSignature = crypto
    // .createHmac("sha256", process.env.key_secret)
    // .update(body.toString())
    // .digest("hex");
    // const isVerified = expectedSignature===razorpay_signature? true:false;
    const isVerified = true;
    if (isVerified) {
        // const updateData = {
        //     "razorpay.paymentId": razorpay_payment_id,
        //     "razorpay.singature": razorpay_signature,
        // };
        // console.log(payment);
        
        const pay={ 
            currency:payment.currency,
            amount :payment.amount,
            createdBy:payment.createdBy,
            Item:payment.Item,
            paid: true,
            status: "Completed"
        }
        const obj = await Payment.create(pay);
        // await payment.remove();
        // const pId = await Payment.findOneAndUpdate({'razorpay.id': orid},updateData)
        // console.log(pId);
        const user = await User.findById(req.user.userId).populate('cart.product');
        await Promise.all(user.cart.map(async (x) => {
            const pro = await Product.findByIdAndUpdate((x.product._id).toString(),{
               $inc:{
                   quantity: -x.quantity
                }
            }
            );
         }));
        user.cart=[];
        user.orderhistory.push(obj._id);
        // console.log(user);
        await user.save();
        const paymessage = await Payment.findById(obj._id,"status Item amount").populate("Item.product")
        const message = [];
        for(let i = 0 ; i < paymessage.Item.length ; i++){
            message.push({
                Quantity:paymessage.Item[i].quantity,
                Product_Name:paymessage.Item[i].product.name,
                Product_Price:paymessage.Item[i].product.price
            })
        }
        console.log(paymessage);
        Email.sendProductEmail(message,user,paymessage.amount)
        const response = sendSuccessApiResponse({ verfied: isVerified });
        res.status(200).json(response);
    }
    else return next(createCustomError("Not a valid Signature",402));

});
generateJWT = function (Payment) {
    return ;
};
const genrateQR = asyncWrapper(async(req,res,next)=>{
    const paymentId = req.body.paymentId;
    const result = await Payment.findOne({paymentId:paymentId});
    if(!result) return next(createCustomError("No payment found",404));
    const token = jwt.sign({id:result._id,userId:req.user.userId ,singature: result.razorpay.singature, paymentId: result.razorpay.paymentId }, process.env.JWT_SECRET, {
        expiresIn: '365d',
    })
    const response = token
    res.json(sendSuccessApiResponse( response));
})
const verifyQR = asyncWrapper(async(req,res,next)=>{
    const token = req.params.token
    const view = req.query.view || false
    const payload =await jwt.verify(token.toString(), process.env.JWT_SECRET);
    const isUser = await User.findById(payload.userId);
    const val = isUser.orderhistory.findIndex(result => result._id.toString()==payload.id)
    if(val!=-1){
        const payment = await Payment.findById(payload.id)
        if(view){
            const payment = await Payment.findById(payload.id,"status Item amount").populate("Item.product")
            return res.json(payment).status(201);
        }
        if(payment.razorpay.singature === payload.singature && payment.razorpay.paymentId === payload.paymentId){
            if(payment.status == 'delivered'){
                return res.json(createCustomError("Already Deliverd",301));
            }
            payment.status = 'delivered'
            await payment.save();
            return res.json(sendSuccessApiResponse(isUser,200));
        }
        return res.json(createCustomError("No Payment Found",404));
    }
    res.json(createCustomError("Unauthorized User",402));

    // if(payload.signature==)
    
})

module.exports = {
    createOrder,
    verifyPayment,
    genrateQR,
    verifyQR
};
