const express=require("express");
const router=express.Router();
const {home}=require("../controllers/homeController");


router.route("/home").get(home);


module.exports=router;




//to import any module/method as {module_name/method_name}, use exports.module_name/method_name

//to import any module/method as const module_name/method_name=require("url"), use module.exports=module_name/method_name