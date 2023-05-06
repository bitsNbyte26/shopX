const express = require("express");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Product = require("../model/product");
const User = require("../model/user");
const Payment = require("../model/Payment");
const mongoose = require("mongoose")

const asyncWrapper = require("../utils/asyncWrapper");


const getAllwishlist = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const doc = await User.findById(userId).populate("wishlist")
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})
const isWishlist = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const {id} = req.params;
    const doc = await User.findById(userId);
    const val = doc.wishlist.findIndex(result => result._id.toString()==id)
    const response = val==-1? false:true
    res.json(sendSuccessApiResponse(response,201));
})
const addWishlist = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const wishlist = req.body.wishlist;
    const doc = await User.findOneAndUpdate({_id:userId},{"$addToSet":{wishlist:wishlist}});
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})

const removeWishlist = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const wishlist = req.params.wishlist;
    const doc = await User.findOneAndUpdate({_id:userId},{"$pull":{wishlist:wishlist}});
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})

const getCart = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const doc = await User.findById(userId).populate("cart.product")
    if(!doc) return next(createCustomError("User Not Found",404));
    await Promise.all(doc.cart.map(async (x) => {
        const pro = await Product.findById(x.product);
        if(x.quantity > pro.quantity)
        {
            x.quantity = pro.quantity;
        }
     }));
    const response = sendSuccessApiResponse(doc,200);
    res.json(response);
})

const addCart = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const cart = req.body.cart;
    const dec = req.query.dec || false;
    const doc = await User.findOne({_id:userId});
    if(!doc) return next(createCustomError("User Not Found",404));
    const val = doc.cart.findIndex(result => result.product.toString()==cart);
    const pro = await Product.findById(cart);
    
    if(val==-1 && pro.quantity != 0) 
    await User.findOneAndUpdate({_id:userId},{"$addToSet":{cart:{
        quantity:1,
        product:cart
    }}});
    else{
        if(dec == false)
        {
            if(pro.quantity <= doc.cart[val].quantity)
            return next(createCustomError("No more soaps available",400))
        }
        dec == false ? doc.cart[val].quantity++ : doc.cart[val].quantity-- ;
        await doc.save();
        const response = sendSuccessApiResponse("Quantity changed",200);
        return res.json(response);
    }
    
    const response = sendSuccessApiResponse("Added to Cart",200);
    res.json(response);
})

const removeCart = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const cart = req.params.cart;
    // console.log(cart);
    const doc = await User.findOneAndUpdate({_id:userId},{"$pull":{cart:{_id:cart}}}).exec();
    // console.log(doc)
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse("Remove from cart",200);
    res.json(response);
})



const ratingandreview = asyncWrapper(async (req,res,next)=>{
 const {productid} = req.params;
    const userId = req.user.userId;
    const {rating, review}= req.body;

    const user = await User.findById(userId);
    if(!user)
    {
        const message = "Not registered";
        return next(createCustomError(message, 403));
    }

    const product = await Product.findById(productid);
    if(!product)
    {
        const message = "Not found";
        return next(createCustomError(message, 403));
    }
    let total= 0;
    if(product.eachrating.length != 0)
     total = product.avgrating * product.eachrating.length;
    const ratingindex = product.eachrating.findIndex(i=>(i.user)==userId)
    
    if(ratingindex == -1)
    product.eachrating[product.eachrating.length] = {user:userId,name:user.Name,date:new Date(), rate:rating,userreview:review};
    else
    {
        total-= product.eachrating[ratingindex].rate;
        product.eachrating[ratingindex] = {user:userId,name:user.Name, date:new Date(), rate:rating,userreview:review};
    }
    total += rating;
    total /= product.eachrating.length;
    product.avgrating = total;
    await product.save();
    const response = sendSuccessApiResponse(product,200);
    res.json(response);
})

const vieworderhistory = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const doc = await User.findById(userId).populate({ 
        path: 'orderhistory',
        populate: {
          path: 'Item.product',
          model: 'product'
        } 
     })
    if(!doc) return next(createCustomError("User Not Found",404));
    const response = sendSuccessApiResponse(doc.orderhistory,200);
    res.json(response);
})

const viewsingleorder = asyncWrapper(async (req,res,next)=>{
    const userId = req.user.userId;
    const {id} = req.params;
    const doc = await User.findOne({orderhistory:{$in:[id]}});
    if(!doc) return next(createCustomError("User Not Found",404));
    const order = await Payment.findById(id);
    const response = sendSuccessApiResponse(order,200);
    res.json(response);
})
const iscart = asyncWrapper(async(req,res,next)=>{
    const userId = req.user.userId;
    const {id} = req.params;
    const doc = await User.findById(userId);
    const val = doc.cart.findIndex(result => result.product.toString()==id)
    const response = val==-1? false:true
    res.json(sendSuccessApiResponse(response,201));
})
module.exports = {
    getAllwishlist,
    addWishlist,
    removeWishlist,
    getCart,
    removeCart,
    addCart,
    ratingandreview,
    vieworderhistory,
    viewsingleorder,
    iscart,
    isWishlist
};