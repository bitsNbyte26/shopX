const express =  require("express");
const { listproduct, viewproduct, searchProduct,checkCart } = require("../controllers/product.controller");
const { authorization } = require("../middleware/authorization");

const router = express.Router();


// User
router.route("/list").get(listproduct);
router.route("/view/:id").get(viewproduct);
router.route("/checkcart/:id").get(checkCart);
router.route("/search").get(searchProduct);




module.exports = router;
