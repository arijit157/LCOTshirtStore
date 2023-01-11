const jwt=require("jsonwebtoken");
const User=require("../models/user");
const CustomError = require("../utils/customError");
const BigPromise=require("./bigPromise");
require("dotenv").config();

//to check user is logged in or not
exports.isLoggedIn=BigPromise(async(req,res,next)=>{

    const token=req.cookies.token || req.header("Authorization").replace("Bearer ",'')||req.body.token;

    if(!token)
    {
        return next(new CustomError("Please login first", 400));
    }

    const decoded=jwt.verify(token, process.env.JWT_SECRET);  //returns an object after verification
    //console.log(decoded);
    req.user=await User.findById(decoded.user_id);  //extracting the info of the user
    //console.log("req.user= "+req.user);

    next();
});

//to check the user is admin or not
exports.customRole=(...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new CustomError("You do not have access to this resource", 400));
        }
        next();
    }
}