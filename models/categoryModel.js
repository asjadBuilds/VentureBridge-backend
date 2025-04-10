import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    categoryId:{
        type:Number,
        required:true,
        unique:true
    },
    parentId:{
        type:Number,
        default:null
    },
    categoryIcon:{
        type:String,
        required:true
    }
})

const Category = mongoose.model("Category", categorySchema);
export default Category;