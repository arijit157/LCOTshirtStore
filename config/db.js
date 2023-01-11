const mongoose=require("mongoose");
require("dotenv").config();


let connect=()=>{
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("DB connected successfully!"))
    .catch((error)=>{
        console.log(error);
        process.exit(1);   //terminate the database connection process
    })
}

module.exports=connect;