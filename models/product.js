const mongoose=require("mongoose");
require("dotenv").config();

const productSchema=new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please provide the name of the product"],
        trim: true,
        maxLength: [130, "Length of the product name exceeded"],
        minLength: [8, "Please provide a valid product name"]
    },

    price:{
        type: Number,
        required: [true, "Please provide the price"],
        minLength: [3, "Please provide a 3-digit price"]
    },

    description:{
        type: String,
        minLength: [10, "Please provide a valid description"],
        maxLength: [130, "Length of the description exceeded"]
    },

    photos: [{
        public_id:{
            type: String,
            required: true
        },
   
        secure_url:{
            type: String,
            required: true
        }
    }],

    category: {
        type: String,
        required: [true, "Please select category from - short-sleeves, long-sleeves, sweatshirt, hoodies"],
        enum:{
            values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
            message: "Please select category from - short-sleeves, long-sleeves, sweatshirt, hoodies"
        }
    },

    brand:{
        type: String,
        required: [true, "Please provide a brand name"]
    },

    rating:{
        type: Number,
        default: 0
    },

    stock:{
        type: Number,
        required: [true, "Please add a number in stock"]
    },
    
    numOfReviews:{
        type: Number,
        default: 0
    },

    reviews: [{
        user:{
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        },

        name:{
            type: String,
            required: true
        },

        rating: {
            type: Number,
            required: true
        },

        comment: {
            type: String,
            required: true
        }
    }],

    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },

    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model("Product", productSchema);