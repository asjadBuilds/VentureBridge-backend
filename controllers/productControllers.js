import { validationResult } from "express-validator";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { uploadFileonCloudinary } from "../utils/cloudinary.js";
import Product from "../models/productModel.js";
import ApiResponse from "../utils/ApiResponse.js";
import Category from "../models/categoryModel.js";
import ViewProduct from "../models/viewProductModel.js";
import User from "../models/userModel.js";
const createProduct = AsyncHandler(async (req, res) => {
  const { title, description, pricing, category } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  const galleryPaths = req.files["gallery"]
    ? req.files["gallery"].map((file) => file.path)
    : [];
  const docPaths = req.files["docs"]
    ? req.files["docs"].map((file) => file.path)
    : [];
  const galleryUrls = await Promise.all(
    galleryPaths.map((path) => uploadFileonCloudinary(path))
  );
  const docUrls = await Promise.all(
    docPaths.map((path) => uploadFileonCloudinary(path))
  );
  if (!galleryUrls) throw new ApiError(500, "error creating gallery urls");
  if (!docUrls) throw new ApiError(500, "error creating doc urls");
  const gallery = galleryUrls.map((item) => item.url);
  const docs = docUrls.map((item) => item.url);
  const categoryObj = await Category.findById(category);
  if (!categoryObj) throw new ApiError(400, "Invalid Category");
  const product = await Product.create({
    title,
    description,
    pricing,
    category: categoryObj,
    images: gallery,
    files: docs,
    user:req?.user?._id
  });
  const createdProduct = await Product.findById(product?._id).populate(
    "category",
    "title parentId"
  );
  if (!createdProduct) throw new ApiError(500, "Error Creating new Product");
  res
    .status(201)
    .json(
      new ApiResponse(201, { createdProduct }, "Product Successfully Created")
    );
});

const createCategory = AsyncHandler(async (req, res) => {
  const { title, categoryId, parentId } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  const validCategory = await Category.findOne({ categoryId });
  if (validCategory) throw new ApiError(402, "Category already exists");
  const iconLocalPath = req?.file?.path;
  const icon = await uploadFileonCloudinary(iconLocalPath);
  if(!icon) throw new ApiError(400, "Failed to create icon");
  const category = await Category.create({
    title,
    categoryId,
    parentId,
    categoryIcon:icon.url,
  });
  const createdCategory = await Category.findOne(category._id);
  if (!createdCategory) throw new ApiError(500, "Error creating new Category");
  res
    .status(201)
    .json(
      new ApiResponse(201, createdCategory, "Category Successfully Created")
    );
});

const updateProduct = AsyncHandler(async (req, res) => {
  let gallery = [];
  let docs = [];
  const { title, description, pricing, category, productId } = req.body;
  const validProduct = await Product.findById(productId);
  if (!validProduct) throw new ApiError(400, "Invalid Product Id");
  if (req.files && req.files["gallery"]) {
    try {
      const galleryPaths = await req.files["gallery"].map((file) => file.path);
      const galleryUrls = await Promise.all(
        galleryPaths.map((path) => uploadFileonCloudinary(path))
      );
      if (!galleryUrls) throw new ApiError(500, "error creating gallery urls");
      gallery = galleryUrls.map((item) => item.url);
    } catch (error) {
      console.log(error);
    }
  }
  if (req.files && req.files["docs"]) {
    try {
      const docPaths = await req.files["docs"].map((file) => file.path);
      const docUrls = await Promise.all(
        docPaths.map((path) => uploadFileonCloudinary(path))
      );
      if (!docUrls) throw new ApiError(500, "error creating doc urls");
      docs = docUrls.map((item) => item.url);
    } catch (error) {
      console.log(error);
    }
  }
  const updateFields = {
    title,
    description,
    pricing,
    category,
  };

  if (gallery.length > 0) {
    updateFields.images = gallery;
  }
  if (docs.length > 0) {
    updateFields.files = docs;
  }
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: updateFields },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, product, "Product Details updated successfully")
    );
});

const getProduct = AsyncHandler(async (req, res) => {
  const { value } = req.body;
  const products = await Product.find({
    title: { $regex: value, $options: "i" },
  });
  res
    .status(200)
    .json(new ApiResponse(200, products, `Search Results for Keyword ${key}`));
});

const deleteProduct = AsyncHandler(async (req, res) => {
  const { productId } = req.body;
  const validId = await Product.findOne({ _id: productId });
  if (!validId) throw new ApiError(400, "Invalid Product Id");
  const product = await Product.findByIdAndDelete(productId, {
    new: true,
  });
  res.status(200).json(new ApiResponse(200, "Product Deleted Successfully"));
});

const getAllProductsByCategory = AsyncHandler(async (req, res) => {
  const { categoryId } = req.body;
  const validCategory = await Category.findById(categoryId);
  if (!validCategory) throw new ApiError(400, "Category is not valid");
  const products = await Product.find({ category: categoryId }).populate('user','-password -resetToken -accessToken -refreshToken -createdAt -updatedAt');
  res
    .status(200)
    .json(new ApiResponse(200, products, "Products successfully fetched"));
});

const getAllCategories = AsyncHandler(async (_, res) => {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
      
    ]);

    res
    .status(200)
    .json(
      new ApiResponse(200, categories, "All Categories successfully fetched")
    );
});

const getUserProducts = AsyncHandler(async(req,res)=>{
  const products = await Product.find({user:req.user?._id})
  res.status(200).json(new ApiResponse(200,products,"User Products successfully fetched"));
})

const getProductById = AsyncHandler(async(req,res)=>{
  const {productId} = req.body;
  console.log(productId)
  const productDetails = await Product.findOne({_id:productId})
  if(!productDetails) throw new ApiError(400, "No Product Found with this id")
  res
  .status(200)
  .json(new ApiResponse(200, productDetails, "Product Details fetched successfully"))
})

const viewProduct = AsyncHandler(async(req,res)=>{
  const {productId,userId} = req.body;
  const alreadyViewed = await ViewProduct.findOne({productId,userId});
  const ownProduct = await Product.findOne({_id:productId,user:userId})
  if(!alreadyViewed && !ownProduct){
    await ViewProduct.create({productId,userId});
    await Product.findByIdAndUpdate(productId,
      {$inc:{viewsCount:1}}
    )
  }
  res
  .status(200)
  .json(new ApiResponse(200, "View Product Api Called"))
})

const addToSaveProducts = AsyncHandler(async(req,res)=>{
  const {productId} = req.body;
  let user;
  const alreadySave = await User.findOne({_id:req.user._id,savedProducts:productId})
  console.log(alreadySave)
  if(alreadySave) throw new ApiError(400,"User already saved the product")
  const ownProduct = await Product.findOne({_id:productId,user:req.user._id})
console.log(ownProduct)
  if(!alreadySave && !ownProduct){
   user = await User.findByIdAndUpdate(req.user._id,{
      $push:{savedProducts:productId}
    },{new:true}).select('-password -accessToken -refreshToken')
  }
  const options = {
    secure: true,
    sameSite: 'None'
  };
  res
  .status(200)
  .cookie('userDetails',user, options)
  res
  .status(200)
  .json(new ApiResponse(200, user, "product added to savedProducts" ))
})

const removeFromSaveProducts = AsyncHandler(async(req,res)=>{
  const {productId} = req.body;
  const product = await User.findOne({_id:req.user._id,savedProducts:productId});
  if(!product) throw new ApiError(400, "User have no such Product");
  const user = await User.findByIdAndUpdate(req.user._id,{
    $pull:{savedProducts:productId}
  },{new:true}).select('-password -accessToken -refreshToken')
  const options = {
    secure: true,
    sameSite: 'None'
  };
  res
  .status(200)
  .cookie('userDetails',user, options)
  res
  .status(200)
  .json(new ApiResponse(200, "product removed from Saved Products"))
})

const getPopularProducts = AsyncHandler(async(req,res)=>{
  const popularProducts = await Product.find()
  .sort({viewsCount:-1})
  .limit(20)
  res
  .status(200)
  .json(new ApiResponse(200, popularProducts, "Popular Products fetched"))
})

export {
  createProduct,
  createCategory,
  updateProduct,
  getProduct,
  deleteProduct,
  getAllProductsByCategory,
  getAllCategories,
  getUserProducts,
  getProductById,
  viewProduct,
  addToSaveProducts,
  removeFromSaveProducts,
  getPopularProducts
};
