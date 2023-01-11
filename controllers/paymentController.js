const BigPromise=require("../middlewares/bigPromise");
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Razorpay=require("razorpay");
const nanoid=require("nanoid");
require("dotenv").config();

exports.sendStripePublicKey=BigPromise(async(req, res, next)=>{
    res.json({
        public_key:process.env.STRIPE_KEY
    });
});

exports.captureStripePayment=BigPromise(async(req, res, next)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount*100,
        currency: 'inr',
        automatic_payment_methods: {enabled: true},
    });
    res.json({
        success: true,
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id
    });

});

exports.sendRazorpayPublicKey=BigPromise(async(req, res, next)=>{
    res.json({
        public_key: process.env.RAZORPAY_KEY
    });
});

exports.captureRazorpayPayment=BigPromise(async(req, res, next)=>{

    const amount = req.body.amount;  
    
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET });
    
    let myOrder=await instance.orders.create({
        amount: amount*100,   //amount in paise
        currency: "INR",
        receipt: nanoid.nanoid()  //used nanoid to generate a random string to indicate receipt number
    });

    res.json({
        success: true,
        amount,
        order: myOrder
    });
})