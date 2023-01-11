const express=require("express");
const { addProduct, getProducts, adminGetProducts, getSingleProduct, adminUpdateOneProduct, adminDeleteOneProduct, addUserReview, deleteOneReview, getAllReviewsOfOneProduct } = require("../controllers/productController");
const { isLoggedIn, customRole }=require("../middlewares/user");
const router=express.Router();


router.route("/admin/products/add").post(isLoggedIn,customRole("admin"), addProduct);
router.route("/products").get(getProducts);
router.route("/admin/products").get(isLoggedIn, customRole("admin"), adminGetProducts);
//router.route("/admin/product/update/:id").post(isLoggedIn, customRole("admin"), adminUpdateOneProduct);
router.route("/admin/product/:id").put(isLoggedIn, customRole("admin"), adminUpdateOneProduct).delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);
router.route("/product/:id").get(getSingleProduct);
router.route("/product/review").put(isLoggedIn, addUserReview);
router.route("/product/:id").delete(isLoggedIn, deleteOneReview);
router.route("/product/reviews/:id").get(getAllReviewsOfOneProduct);
module.exports=router;