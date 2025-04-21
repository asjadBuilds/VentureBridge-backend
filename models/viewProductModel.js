import mongoose from "mongoose";

const viewProductSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }
},{timestamps:true});

const ViewProduct = mongoose.model('ViewProduct',viewProductSchema);

export default ViewProduct;