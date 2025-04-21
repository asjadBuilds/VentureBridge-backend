import { mongoose } from "mongoose";

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    pricing:{
        minPrice:{
            type:Number,
            required:true
        },
        avgPrice:{
            type:Number,
            required:true
        },
        maxPrice:{
            type:Number,
            required:true
        }
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    images:[{
        type:String,
        required:false
    }],
    files:[{
        type:String,
        required:false
    }],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    viewsCount:{
        type:Number,
        default:0
    }
})

const Product = mongoose.model("Product", productSchema);

export default Product;