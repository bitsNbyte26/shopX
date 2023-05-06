const express = require("express");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const APIFeatures = require("../utils/APIfeature");
const User = require("../model/user");
const Product = require("../model/product")
const asyncWrapper = require("../utils/asyncWrapper");

const listproduct = async (req, res, next) => {
    try{
  
        const products = await Product.find({});
        if (!products) {
            const message = "No products to show";
            return next(createCustomError(message, 403));
        }
        else{
            res.json(sendSuccessApiResponse(products, 200));
        }
    }
    catch(err){
        return createCustomError(err,400);
    }
};

const checkCart = asyncWrapper(async(req,res,next)=>{
    const isUser = await User.findById(req.user.userId);
    var isCart = false;
    var isWishlist = false;
    if(!isUser){
        return next(createCustomError("User not found", 404));
    }
    if(isUser.cart.find(x => x.product.toString()==req.params)) isCart = true;
    if(isUser.wishlist.find(x => x._id.toString()==req.params)) isWishlist = true;
    res.json(sendSuccessApiResponse({Cart:isCart,wishlist:isWishlist}, 201));
})
const viewproduct = async (req, res, next) => {
  try{
      const {
        id
      } = req.params;
      const product = await Product.findById(id);
      if (!product) {
          const message = "Product not found";
          return next(createCustomError(message, 403));
      }
      else{
          res.json(sendSuccessApiResponse(product, 201));
      }
  }
  catch(err){
      return createCustomError(err,400);
  }
};
const searchProduct = asyncWrapper(async (req,res,next)=>{
    const SearchString = ["name","category"];
    const query = new APIFeatures(Product.find(),req.query).search(SearchString);
    const data = await query.query;
    const response = sendSuccessApiResponse(data);
    res.json(response);
})

module.exports = {
    listproduct,
    viewproduct,
    searchProduct,
    checkCart
};
