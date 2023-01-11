require("dotenv").config();
const express=require("express");
const cookieParser=require("cookie-parser");
const fileUpload=require("express-fileupload");
const morgan=require("morgan");
const app=express();

const home=require("./routes/home");   
const user=require("./routes/user");
const product=require("./routes/product");
const payment=require("./routes/payment");
const order=require("./routes/order");

//regular middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir: "/tmp/"
}));
app.use(express.static("./public"));
app.set("view engine", "ejs");

//morgan middleware
app.use(morgan("tiny"));

//router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);

app.get("/signup", (req,res)=>{
    res.render("signupTest");
});

module.exports=app;