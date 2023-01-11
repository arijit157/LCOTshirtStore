//code for sign up

const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/customError");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

exports.signup = BigPromise(async (req, res, next) => {
    let result;

    if (req.files) {
        const file = req.files.photo;
        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,  //optional
            crop: "scale"  //optional
        });
        //console.log(result);
    }
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return next(new CustomError("Please provide the email", 400));
    }

    const isRegistered = await User.findOne({ email });

    if (isRegistered) {
        return next(new CustomError("User is already registered", 400));
    }

    const user = await User.create({
        name: req.body.name,  //name
        email: req.body.email,  //email
        password: req.body.password,  //password
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });

    cookieToken(user, res);
});

//for login
exports.login = BigPromise(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new CustomError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new CustomError("Email or password does not match or exists", 400));
    }

    const isPasswordCorrect = await user.isValidatedPassword(password);
    //console.log(isPasswordCorrect);

    if (!isPasswordCorrect) {
        return next(new CustomError("Email or password does not match or exists", 400));
    }

    //console.log(user);

    cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    const options = {
        expires: new Date(Date.now()),
        httpOnly: true
    }
    res.cookie("token", null, options);
    res.json({
        success: true,
        message: "logged out successfully"
    })
});

//sending email to reset password
exports.forgotPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return next(new CustomError("User is not registered", 400));
    }
    let forgotToken = user.getForgotPasswordToken();

    await user.save({ validateBeforeSave: false });  //saving forgotPasswordToken and forgotPasswordExpiry into the database

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    const message = `Copy paste this link into your address bar and hit enter\n\n ${myUrl}`;

    try {
        await mailHelper({
            email: user.email,
            subject: "LCO TStore: Password Reset",
            message: message
        });

        res.json({ success: true, message: "Email sent successfully!" });

    } catch (error) {

        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        
        return next(new CustomError(error.message, 400));

    }
});

exports.passwordReset = BigPromise(async (req, res, next) => {    //BUGS

    const token = req.params.token;

    //console.log(token);

    const encryToken = crypto.createHash("sha256").update(token).digest("hex");

    //console.log("Encrypted token: " + encryToken);

    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry: { $gt: Date.now() }   //$gt means greater than in MongoDB
    });

    if (!user) {
        return next(new CustomError("Token is invalid or incorrect", 400));
    }

    if (req.body.password !== req.body.confPassword) {
        return next(new CustomError("Password and Confirm password does not match", 400));
    }

    user.password = req.body.password;  //saving the new entered password

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });   //saving into the database

    // res.json({
    //     success: true,
    //     message: "Password reset successfully!"
    // });  //we can also send JSON message like this

    //But to maintain the learning flow with Hitesh Sir I am writing the code given below:
    cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {

    // const {_id}=req.user;
    // const user=await User.findOne({_id});
    const user = await User.findById(req.user._id);
    res.json({
        success: true,
        user
    });
});

exports.updatePassword = BigPromise(async (req, res, next) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    isCorrectPassword = await user.isValidatedPassword(oldPassword);

    console.log(isCorrectPassword);

    if (!isCorrectPassword) {
        return next(new CustomError("Password did not match", 400));
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    cookieToken(user, res);

    res.json({
        success: true,
        message: "Password updated successfully"
    });
});

//update user information
exports.updateUserDetails = BigPromise(async (req, res, next) => {

    const newInfo = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.files) {
        let user = await User.findById(req.user._id);

        const imageId = user.photo.id;

        const resp = cloudinary.uploader.destroy(imageId);  //to delete the existing photo

        const file = req.files.photo;

        //to upload the new photo
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        });

        newInfo.photo = {  //adding 'photo' property to the newInfo object
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user._id, newInfo, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.json({
        success: true,
        message: "Profile updated successfully!",
        user
    });

});

//admin access
exports.adminAllUsers = BigPromise(async (req, res, next) => {

    const users = await User.find({}); //same as await User.find()  //returns an array of objects
    console.log(users);
    res.json({
        success: true,
        users
    });

});

//manager access
exports.managerAllUsers = BigPromise(async (req, res, next) => {

    const users = await User.find({ role: "user" });

    res.json({
        success: true,
        users
    });

});

//to access info of a specific user by the admin
exports.adminGetOneUser=BigPromise(async(req, res, next)=>{

    const userId=req.params.id;

    const user=await User.findById(userId);

    res.json({
        success: true,
        user
    });

});

//update user info by admin
exports.adminUpdateOneUserDetails=BigPromise(async(req, res, next)=>{
    const newData={
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user=await User.findByIdAndUpdate(req.params.id, newData,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.json({
        success: true,
        user
    });

});

exports.adminDeleteOneUser=BigPromise(async(req, res, next)=>{

    //const user=await User.deleteOne({_id: req.params.id});
    const user=await User.findById(req.params.id);

    const photoId=user.photo.id;

    const result1=await cloudinary.uploader.destroy(photoId);

    //const result2=await user.deleteOne({_id: req.params.id});  //we can also use this method to delete user
    const result2=await user.remove();
    
    res.json({
        success: true,
        message: "User removed successfully!"
    });
});