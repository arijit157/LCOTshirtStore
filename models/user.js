const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
require("dotenv").config();

const userSchema=new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
        maxLength: [40, "Name should be within 40 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        validate: [validator.isEmail, "Invalid email ID"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        minLength: [8, "Password should be of 8 characters long"],
        select: false  //it will do not show password in the response (same as user.password=undefined)
    },
    role:{
        type: String,
        default: "user"
    },
    photo:{
        id:{
            type: String,
            required: true
        },
        secure_url:{
            type: String,
            required: true
        }
    },
    forgotPasswordToken:{
        type: String
    },
    forgotPasswordExpiry:{
        type: Date
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

//encrypt the password before saving to the database (hook)
userSchema.pre("save", async function(next){
    if (!this.isModified("password")){
        return next();
    }
    this.password=await bcrypt.hash(this.password, 10);
});

//password validation method
userSchema.methods.isValidatedPassword=async function(userSendPassword){
    return await bcrypt.compare(userSendPassword, this.password);
}

userSchema.methods.createJwtToken=function(){
     return jwt.sign(
        {user_id: this._id, email: this.email},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY
        }
    );
}

userSchema.methods.getForgotPasswordToken=function(){

    let forgotToken= crypto.randomBytes(20).toString('hex');  //to generate a random string

    this.forgotPasswordToken=crypto.createHash("sha256").digest("hex");  //encrypting the generated random string
    
    this.forgotPasswordExpiry=Date.now()+20*60*1000;  //token will be valid for 1 hour
    
    return forgotToken;
    
}


module.exports=mongoose.model("User", userSchema);