import express from "express";
import upload from "../middlewares/multer.middleware.js";
import { query } from "express-validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCategory, createProduct, deleteProduct, getAllCategories, getAllProductsByCategory, getProduct, getProductById, getUserProducts, updateProduct } from "../controllers/productControllers.js";
const route = express.Router();

route.post('/createProduct',
     upload.fields([{name:'gallery', maxCount:6}, {name:'docs', maxCount:4}]),
      
      [
        query('title').isEmpty(),
        query('description').isEmpty(),
        query('pricing').isEmpty(),
        query('category').isEmpty()
      ],
    createProduct);

route.post('/getProduct',getProduct)
route.post('/getUserProducts',getUserProducts)
route.post('/createCategory',[
    query('title').isEmpty(),
    query('categoryId').isEmpty()
],upload.single('categoryIcon'), createCategory)

route.post('/updateProduct',
  upload.fields([{name:'gallery', maxCount:6}, {name:'docs', maxCount:4}]),
  updateProduct)

route.post('/deleteProduct',deleteProduct)

route.post('/getProductsByCategory', getAllProductsByCategory)

route.get('/getAllCategories',getAllCategories)

route.post('/getProductById', getProductById)

export default route;
