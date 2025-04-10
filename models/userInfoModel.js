import mongoose from "mongoose";

const userInfoSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    fullName:{
        type:String,
    },
    dateOfBirth:{
        type:Date,
    },
    aboutDescription:{
        type:String,
    },
    country:{
        type:String,
    },
    city:{
        type:String,
    },
    education:[{
        _id:mongoose.Types.ObjectId,
        instituteName:{
            type:String,
            required:true
        },
        degreeName:{
            type:String,
            required:true
        },
        duration:{
            type:String,
            required:true
        },
        cgpa:{
            type:Number,
        },
        grade:{
            type:String,
        },
        percentage:{
            type:Number,
        },
    }],
    experience: [
        {
            _id:mongoose.Types.ObjectId,
          title: {
            type: String,
          },
          companyName: {
            type: String,
          },
          industry: {
            type: String,
          },
          duration: {
            type:String,
            required:true
          },
          description: {
            type: String,
          },
          role: {
            type: String,
          },
        },
      ],
    certifications:[{
        _id:mongoose.Types.ObjectId,
        title:{
            type:String,
            required:true
        },
        institute:{
            type:String,
            required:true
        },
        duration:{
            type:String,
            required:true
        },
        description:{
            type:String,
        },
    }],
    languages:[{
        _id:mongoose.Types.ObjectId,
        name:{
            type:String,
            required:true
        },
        level:{
            type:String,
            required:true
        },
    }],
})

const UserInfo = mongoose.model("UserInfo", userInfoSchema);
export default UserInfo;