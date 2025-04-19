import express from "express";
import auth from "./auth.Route.js";
import productRoute from './productRoute.js'
import user from './user.Route.js'
import chat from './message.Route.js'
const router = express.Router();

router.use('/auth',auth)
router.use('/product',productRoute)
router.use('/user',user)
router.use('/chat',chat)
export default router;