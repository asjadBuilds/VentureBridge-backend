import express from "express";
import { query } from "express-validator";
import { createUser, signIn, logout, refreshAccessToken, sendForgetMail, verifyOTP } from "../controllers/authControllers.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const route=express.Router();

route.post("/registerUser",[
    query("username").notEmpty(),
    query("email").isEmail(),
    query("password").isLength({min:8}),
    query("role").notEmpty()
],upload.single('avatar')
,createUser);

route.post("/loginUser",[
    query("email").notEmpty(),
    query("password").isLength({min:8})
],signIn);

route.post("/logoutUser", verifyJWT, logout);

route.post("/refreshToken", verifyJWT, refreshAccessToken);

route.post("/forgetPassword", [
    query("email").notEmpty().isEmail()
], sendForgetMail);
route.post("/verifyOTP", verifyOTP)

export default route;