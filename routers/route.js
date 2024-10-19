const express=require("express");
const registerUser = require("../controllers/RegisterUser");
const checkEmail = require("../controllers/CheckEmail");
const checkPassword = require("../controllers/CheckPassword");
const getUserDetails = require("../controllers/UserDetails");
const logOut = require("../controllers/LogOut");
const updateUser = require("../controllers/UpdateUser");
const searchUser = require("../controllers/UserSearch");
const updatePassword=require("../controllers/UpdatePassword");

const router=express.Router();

router.post("/register", registerUser);
router.post("/email", checkEmail);
router.post("/password", checkPassword);
router.get("/user", getUserDetails);
router.get("/logout", logOut);
router.post("/update", updateUser);
router.post("/search", searchUser);
router.post("/updatePassword", updatePassword);

module.exports=router;