const Order=require("../models/order");
const Product=require("../models/product");
const BigPromise=require("../middlewares/bigPromise");
const CustomError=require("../utils/customError");
const mongoose=require("mongoose");

exports.createOrder=BigPromise(async(req, res, next)=>{
    const {shippingInfo, paymentInfo, taxAmount, shippingAmount, totalAmount, orderStatus, orderItems}=req.body;
    let order=await Order.create({
        shippingInfo,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        orderStatus,
        orderItems,
        user: req.user._id
    });

    res.json({
        success: true,
        message: "Order created successfully!",
        order
    });

});

exports.getOneOrder=BigPromise(async(req, res, next)=>{
    let orderId=req.params.id;
    let order=await Order.findById(orderId).populate("user", "name email photo");
    if(!order){
        return next(new CustomError("Order not found", 400));
    }

    res.json({
        success: true,
        order
    });
});

exports.getLoggedInUserOrders=BigPromise(async(req, res, next)=>{
    let userId=req.user._id;
    let orders=await Order.find({user:userId});
    if(!orders){
        return next(new CustomError("Order(s) not found", 400));
    }
    res.json({
        success: true,
        orders
    });
});

exports.adminGetAllOrders=BigPromise(async(req, res, next)=>{
    let orders=await Order.find();
    res.json({
        success: true,
        orders
    });
});

exports.adminUpdateOrder=BigPromise(async(req, res, next)=>{
    let orderId=req.params.id;
    
    let order=await Order.findById(orderId);
    
    if(order.orderStatus == "delivered"){
        return next(new CustomError("Order already marked as delivered",401));
    }

    order.orderItems.forEach(async(prod)=>{
        await updateProductStock(prod.product, prod.quantity);
    });

    order.orderStatus=req.body.orderStatus;
    await order.save({validateBeforeSave: false});

    res.json({
        success: true,
        message: "order status updated successfully",
        order
    });
});

let updateProductStock=async(productId, quantity, next)=>{
    let product=await Product.findById(productId);
    if(product.stock==0){
        return next(new CustomError("No initial items in the stock", 400));
    }
    product.stock=product.stock-quantity;
    await product.save({validateBeforeSave: true});
}


exports.adminDeleteOrder=BigPromise(async(req, res, next)=>{
    let orderId=req.params.id;
    let order=await Order.findById(orderId);
    if(order.orderStatus == "delivered")
    {
        return next(new CustomError("Delivered order cannot be deleted", 400));
    }
    await order.remove();
    let myOrders=await Order.find();

    res.json({
        success: true,
        message: "Order deleted successfully",
        myOrders
    });
});