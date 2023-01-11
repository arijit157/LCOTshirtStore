const mongoose=require("mongoose");
require("dotenv").config();

const orderSchema=new mongoose.Schema({
    shippingInfo:{
        address:{
            type: String,
            required: true
        },
        city:{
            type: String,
            requires: true
        },
        phoneNo:{
            type: String,
            requires: true
        },
        postalCode:{
            type: String,
            requires: true
        },
        state:{
            type: String,
            requires: true
        },
        country:{
            type: String,
            requires: true
        }
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",  //we are taking the user from the User model
        required: true
    },
    orderItems:[{
        name:{
            type: String,
            required: true
        },
        quantity:{
            type: Number,
            requires: true
        },
        image:{
            public_id:{
                type: String,
                required: true
            },
            secure_url:{
                type: String,
                required: true
            }
        },
        price:{
            type: Number,
            required: true
        },
        product:{
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true
        }
    }],
    paymentInfo:{
        id:{
            type: String
        }
    },
    taxAmount:{
        type:Number,
        required: true
    },
    shippingAmount:{
        type:Number,
        required: true
    },
    totalAmount:{
        type:Number,
        required: true
    },
    orderStatus:{
        type: String,
        required: true,
        enum:{
            values: ["processing", "out for delivery", "delivered"],
            message: "Please provide correct status - processing, out for delivery, delivered"
        },
        default: "processing"
    },
    deliveredAt:{
        type: Date,
        //required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }

});



module.exports=mongoose.model("Order", orderSchema);