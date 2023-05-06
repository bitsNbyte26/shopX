const express = require("express");
const auth = require("./auth.route");
const admin = require("./admin.route");
const product = require("./product.route");
const user = require("./user.route");
const payment = require("./payment.route");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("SPC API server is running!!!");
});
router.use("/auth",auth);
router.use("/admin",admin);
router.use("/product",product);
router.use("/user",user);
router.use("/payment",payment);


module.exports = router;
