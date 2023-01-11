const express=require("express");
const { createOrder, getOneOrder, getLoggedInUserOrders, adminGetAllOrders, adminUpdateOrder, adminDeleteOrder } = require("../controllers/orderController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router=express.Router();


router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/myorder").get(isLoggedIn, getLoggedInUserOrders);

router.route("/admin/order").get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router.route("/admin/order/update/:id").put(isLoggedIn, customRole("admin"), adminUpdateOrder);
router.route("/admin/order/delete/:id").delete(isLoggedIn, customRole("admin"), adminDeleteOrder);



module.exports=router;