import express from "express";
import upload from "../middlewares/multer.middleware.js";
import { query } from "express-validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToSaveProducts, createCategory, createProduct, deleteProduct, getAllCategories, getAllProductsByCategory, getPopularProducts, getProduct, getProductById, getSavedProducts, getUserProducts, removeFromSaveProducts, updateProduct, viewProduct } from "../controllers/productControllers.js";
const route = express.Router();

route.post('/createProduct',
     upload.fields([{name:'gallery', maxCount:6}, {name:'docs', maxCount:4}]),
      [
        query('title').isEmpty(),
        query('description').isEmpty(),
        query('pricing').isEmpty(),
        query('category').isEmpty()
      ],
      verifyJWT,
    createProduct);

route.post('/getProduct',getProduct)
route.post('/getUserProducts',verifyJWT, getUserProducts)
route.post('/createCategory',[
    query('title').isEmpty(),
    query('categoryId').isEmpty()
],upload.single('categoryIcon'),verifyJWT, createCategory)

route.post('/updateProduct',
  upload.fields([{name:'gallery', maxCount:6}, {name:'docs', maxCount:4}]),
  updateProduct)

route.post('/deleteProduct',deleteProduct)

route.post('/getProductsByCategory', getAllProductsByCategory)

route.get('/getAllCategories',getAllCategories)

route.post('/getProductById', verifyJWT, getProductById)

route.post('/viewProduct',verifyJWT,viewProduct)

route.post('/addToSaveProducts',verifyJWT, addToSaveProducts)

route.post('/removeFromSaveProducts',verifyJWT, removeFromSaveProducts)

route.post('/getSavedProducts',verifyJWT, getSavedProducts)

route.post('/getPopularProducts',getPopularProducts)

export default route;
