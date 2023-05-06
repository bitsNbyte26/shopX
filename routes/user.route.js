const express =  require("express");
const { getAllwishlist,addWishlist,removeWishlist, getCart, addCart, removeCart, ratingandreview, vieworderhistory, viewsingleorder, iscart, isWishlist } = require("../controllers/user.controller");
const { authorization } = require("../middleware/authorization");

const router = express.Router();


//wishlist
router.route("/wishlist").get(authorization,getAllwishlist);
router.route("/wishlist").post(authorization,addWishlist);
router.route("/wishlist/:wishlist").delete(authorization,removeWishlist);
router.route("/wishlist/:id").get(authorization,isWishlist);

//cart
router.route("/cart").get(authorization,getCart);
router.route("/cart").post(authorization,addCart);
router.route("/cart/:cart").delete(authorization,removeCart);
router.route("/cart/:id").get(authorization,iscart);


//rating and review
router.route("/ratingandreview/:productid").post(authorization,ratingandreview);

// router.route("/viewproduct/:id").get(viewproduct);

router.route("/vieworderhistory").get(authorization,vieworderhistory);
router.route("/vieworder/:id").get(authorization,viewsingleorder);

module.exports = router;
