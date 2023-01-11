const BigPromise = require("../middlewares/bigPromise");
const cloudinary = require("cloudinary").v2;
const CustomError = require("../utils/customError");
const Product = require("../models/product");
const WhereClause = require("../utils/whereClause");
const User = require("../models/user");

exports.addProduct = BigPromise(async (req, res, next) => {
    if (!req.files) {
        return next(new CustomError("Please upload images", 400));
    }

    let imageArray = [];  //an array of object

    for (let index = 0; index < req.files.photos.length; index++) {
        const result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
            folder: "products"
        });

        imageArray.push({
            public_id: result.public_id,
            secure_url: result.secure_url
        });
    }

    console.log(imageArray);

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    console.log("req.body.photos = " + req.body.photos);
    console.log("req.body.user = " + req.body.user);

    const { name, price, description, brand, photos, user, category, stock } = req.body;

    if (!name || !price || !description || !brand || !photos || !user || !category || !stock) {
        return next(new CustomError("All fields are necessary", 400));
    }

    const product = await Product.create(req.body);   //same as the below commented codes

    // const product=await Product.create({
    //     name,
    //     price,
    //     description,
    //     brand,
    //     category,
    //     photos: imageArray,
    //     user: req.user.id
    // });

    console.log(product);

    res.json({
        success: true,
        message: "Product created successfully!",
        product
    });

});

exports.getProducts = BigPromise(async (req, res, next) => {

    let resultPerPage = 6;

    let totalProductCount = await Product.countDocuments(); //count the total number of products in the database

    let productsObj = new WhereClause(Product.find({}), req.query).search().filter();  //object

    let products = await productsObj.base;  //returns an array of objects

    let filteredProductCount = products.length;

    productsObj.pager(resultPerPage);

    products = await productsObj.base.clone();  //returns an array (array of objects) with 6 objects 

    console.log("products.base = " + products.base)


    res.json({
        success: true,
        products,  //shows only 6 products
        filteredProductCount,
        totalProductCount
    });

});

exports.adminGetProducts = BigPromise(async (req, res, next) => {

    let products = await Product.find({});
    res.json({
        success: true,
        products
    });

});

exports.getSingleProduct = BigPromise(async (req, res, next) => {

    let productId = req.params.id;

    let product = await Product.findById(productId);

    if (!product) {
        return next(new CustomError("Product not found", 400));
    }

    res.json({
        success: true,
        product
    });

});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {

    const { name, price, description, brand } = req.body;

    const newInfo = {
        name,
        price,
        description,
        brand
    }

    if (req.files) {

        const productId = req.params.id;

        let product = await Product.findById(productId);

        if (!product) {
            return next(new CustomError("Product not found", 400));
        }

        let productPhotos = product.photos;  //array of objects

        for (let i = 0; i < productPhotos.length; i++) {
            let deletedResult = cloudinary.uploader.destroy(productPhotos[i].public_id);
        }

        let imageArray = [];  //an array of object

        for (let index = 0; index < req.files.photos.length; index++) {
            const result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products"
            });

            imageArray.push({
                public_id: result.public_id,
                secure_url: result.secure_url
            });

        }
        newInfo.photos=imageArray;
    }

    let product=await Product.findByIdAndUpdate(req.params.id, newInfo, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.json({
        success: true,
        message: "Product updated successfully!",
        product
    });

});

exports.adminDeleteOneProduct=BigPromise(async(req, res, next)=>{
    const prodId=req.params.id;

    const product=await Product.findById(prodId);

    if(!product){
        return next(new CustomError("Product not found", 400));
    }

    let productPhotos=product.photos;  //array of objects

    for (let index = 0; index < productPhotos.length; index++) {
        let result=await cloudinary.uploader.destroy(productPhotos[index].public_id);
    }

    //let deletesProduct=await product.deleteOne({_id:prodId});
    let deletesProduct=await product.remove();  //works same as above

    res.json({
        "success":true,
        "message":"Product deleted successfully",
    });

});

exports.addUserReview=BigPromise(async(req, res, next)=>{
    // let prodId=req.params.id;

    // let product=await Product.findById(prodId);

    // if(!product){
    //     return next(new CustomError("Product not found", 400));
    // }

    // const {rating, comment}=req.body;

    // product.reviews.push({
    //     user: req.user._id,
    //     name: req.user.name,
    //     rating,
    //     comment
    // });

    // product.numOfReviews=product.reviews.length;

    // await product.save({validateBeforeSave: false});
    // res.json({
    //     success: true,
    //     product
    // });

    const {rating, comment, productId}=req.body;

    let review={
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    let product=await Product.findById(productId);
    let isAlreadyReviewed=product.reviews.find((rev)=>{
        return (rev.user.toString()===req.user._id.toString());
    });
    if(isAlreadyReviewed){
        product.reviews.forEach((review)=>{
            if(review.user.toString()===req.user._id.toString()){
                review.comment=comment;
                review.rating=rating;
            }
        })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews=product.reviews.length;
    }

    //adjust overall rating
    product.rating=product.reviews.reduce((acc,item)=>item.rating+acc, 0)/ product.reviews.length;

    await product.save({validateBeforeSave: false});
    res.json({
        success: true,
        message: "Review added successfully!",
        product
    });
});

exports.deleteOneReview=BigPromise(async(req, res, next)=>{
    let productId=req.params.id;

    let product=await Product.findById(productId);

    let reviews=product.reviews.filter((rev)=>{
        return (rev.user.toString()!==req.user._id.toString());
    });  //array of only one object
    console.log(reviews);

    let numOfReviews=reviews.length;

    product.rating=product.reviews.reduce((acc,item)=>item.rating+acc, 0)/ product.reviews.length;

    let updateProduct=await Product.findByIdAndUpdate(productId,{
        reviews,
        numOfReviews
    },{
        new: true,
        runValidators:true,
        useFindAndModify: false
    });

    res.json({
        success: true,
        message: "Review deleted successfully!",
        product
    });

});

exports.getAllReviewsOfOneProduct=BigPromise(async(req, res,next)=>{
    let productId=req.params.id;

    let products=await Product.findById(productId);

    if(!products){
        return next(new CustomError("Product not found", 400));
    }

    let allReviews=products.reviews;

    console.log(allReviews);

    res.json({
        success: true,
        message: "All reviews fetched successfully",
        allReviews
    });

});