const express =  require("express");
const { createOrder, verifyPayment, genrateQR, verifyQR } = require("../controllers/payment.controller");
const { authorization } = require("../middleware/authorization");

/**
 * Endpoint: /payment
 */
const router = express.Router();

router.route("/order").post(authorization,createOrder);
router.route("/verify").post(authorization,verifyPayment);
router.route("/generate").post(authorization,genrateQR);
router.route("/verifyqr/:token").get(verifyQR);



module.exports = router;

