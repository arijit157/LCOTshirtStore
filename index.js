const app=require("./app");
const cloudinary=require("cloudinary").v2;
require("dotenv").config();
const connect=require("./config/db");

connect();  //database connection

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

app.listen(process.env.PORT || 4000, ()=>{
    console.log(`Server is running at ${process.env.PORT}`);
});