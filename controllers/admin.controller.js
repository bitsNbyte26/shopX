const express = require("express");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const User = require("../model/user");
const Product = require("../model/product")
const asyncWrapper = require("../utils/asyncWrapper");
const path = require('path');
const Payment = require("../model/Payment");
const { default: mongoose, isObjectIdOrHexString } = require("mongoose");

const addproduct = async (req, res, next) => {
  try{
    const id = req.user.userId;
    const {
      name,
      category,
      quantity,
      description,
      price
      } = req.body;
    const image = req.files;
      console.log(req.files)
    const imageUrl=[];
    if(image){
    image.forEach(image=>{
      imageUrl.push("/public/"+image.originalname);
    })
  }
  const toStore = {
    name,
    category,
    quantity,
    description,
    price,
    imageUrl
  };
  const user = await User.findById(id);
  if (!user) {
    const message = "Not registered";
    return next(createCustomError(message, 403));
  }
  else if(user.role != "Admin"){
    const message = "Not an admin";
    return next(createCustomError(message, 403));
  }
  else{
    console.log(1)
    const product = await Product.create(toStore);
    res.json(sendSuccessApiResponse(product, 201));
  }
}
catch(err){
  return createCustomError(err,400);
}
};


const updateproduct = async (req, res, next) => {
  try{
    const id = req.user.userId;
    console.log(id);
      const {
        name,
        category,
        quantity,
        description,
        price,
        oldImgArray,
        productid
      } = req.body;
      const image = req.files;
      let oldImage = JSON.parse(oldImgArray);
      console.log(oldImage);
      const toStore = {
        name,
        category,
        quantity,
        description,
        price
      };
      const user = await User.findById(id);
      if (!user) {
          const message = "Not registered";
          return next(createCustomError(message, 403));
      }
      else if(user.role != "Admin"){
        const message = "Not an admin";
        return next(createCustomError(message, 403));
      }
      else{
          const product = await Product.updateOne({_id:productid},toStore);
          const Image = await Product.findById(productid);
          if(oldImage){
            Image.imageUrl = [];
            await Image.save();
            console.log(Image.imageUrl)
            oldImage.forEach(image => {
              Image.imageUrl.push(image);
            })
            await Image.save()
          }
          if(image){
            image.forEach(image=>{
              Image.imageUrl.push(`/public/${image.filename}`);
            })
            await Image.save()
          }
          res.json(sendSuccessApiResponse(product, 201));
      }
  }
  catch(err){
      return createCustomError(err,400);
  }
};

const deleteproduct = asyncWrapper(async(req,res,next)=>{
  const product = req.params.productid;
  const result = await Product.findByIdAndDelete(product);
  if(!result) return next(createCustomError(`${product} not found`,404));
  res.json(sendSuccessApiResponse(result,200));
})


const orderlist = asyncWrapper(async (req,res,next)=>{
  const doc = await Payment.find({}).populate('Item.product createdBy',
  {
    password:0, wishlist:0, role:0, isVerified:0, orderhistory:0, isActive:0,cart:0
  }
  )
  if(!doc) return next(createCustomError("Order Not Found",404));
  const response = sendSuccessApiResponse(doc,200);
  res.json(response);
})


const filterorders = asyncWrapper(async (req,res,next)=>{
  const filter = req.query.status;
  const search = req.query.search;
  const condition={};
  if(filter)
  {
    condition.status = filter;
  }
  if(isObjectIdOrHexString(search))
  {
    condition._id = mongoose.Types.ObjectId(search)
  }
  if(!search || isObjectIdOrHexString(search)){
  const doc = await Payment.find(condition).populate('Item.product createdBy',
  {
    password:0, wishlist:0, role:0, isVerified:0, orderhistory:0, isActive:0,cart:0
  }
  )
  if(!doc) return next(createCustomError("User Not Found",404));
  const response = sendSuccessApiResponse(doc,200);
  res.json(response);
}
else
{
  let data=[]
  const temp = await User.find(
         { $or: [ 
    {Name:{$regex:search,$options:"xi"}},
    {email:{$regex:search,$options:"xi"}},
    {phoneNumber:{$regex:search,$options:"xi"}}
  ]}
  )
  if(temp)
  {
    const cond = {};
    if(filter)
    {
      cond.status = filter;
    }
    for(var i=0;i<temp.length;i++){
      cond.createdBy = temp[i]._id;
      x = await Payment.find(cond).populate('Item.product createdBy',
      {
        password:0, wishlist:0, role:0, isVerified:0, orderhistory:0, isActive:0,cart:0
      });
      data.push(...x);
    }
  }
  

if(!data) return next(createCustomError("Order Not Found",404));

const response = sendSuccessApiResponse(data);
res.json(response);}
})


const changestatus = asyncWrapper(async(req,res,next)=>{
  const {status,payid} = req.body;
  const id = req.user.userId;
  const user = await User.findById(id);
      if (!user) {
          const message = "Not registered";
          return next(createCustomError(message, 403));
      }
      else if(user.role != "Admin"){
        const message = "Not an admin";
        return next(createCustomError(message, 403));
      }
      else{
      const payment = await Payment.findById(payid);
      if(!payment)
      return res.json(createCustomError("No Payment Found",404));
      payment.status = status
      await payment.save();
      return res.json(sendSuccessApiResponse('status updated',200));
      }
})


module.exports = {
    addproduct,
    updateproduct,
    deleteproduct,
    orderlist,
    filterorders,
    changestatus
};
