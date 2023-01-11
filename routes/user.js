const express=require("express");
const router=express.Router();
const {signup, login, logout, forgotPassword, passwordReset, getLoggedInUserDetails, updatePassword, updateUserDetails, adminAllUsers, managerAllUsers, adminGetOneUser, adminUpdateOneUserDetails, adminDeleteOneUser}=require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, updatePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);
router.route("/admin/user").get(isLoggedIn,customRole("admin"),adminAllUsers);
router.route("/manager/user").get(isLoggedIn, customRole("manager"), managerAllUsers);
router.route("/admin/user/:id").get(isLoggedIn, customRole("admin"), adminGetOneUser).put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails).delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);
//router.route("/admin/user/:id").post(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails);
//router.route("/admin/user/:id").delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);


module.exports=router;