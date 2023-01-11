const express=require("express");
const { sendStripePublicKey, sendRazorpayPublicKey, captureStripePayment, captureRazorpayPayment } = require("../controllers/paymentController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router=express.Router();

router.route("/stripe/key").get(isLoggedIn,customRole("admin"),sendStripePublicKey);
router.route("/razorpay/key").get(isLoggedIn, customRole("admin"), sendRazorpayPublicKey);
router.route("/stripe/order").post(isLoggedIn, captureStripePayment);
router.route("/razorpay/order").post(isLoggedIn, captureRazorpayPayment);

module.exports=router;