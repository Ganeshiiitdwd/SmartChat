import mongoose from "mongoose";

const connectDB=async(url)=>{
    try{
        mongoose.set('strictQuery',true)
        await mongoose.connect(url)
        console.log("CONNECT TO THE DATABASE...!")   
    }catch(err){
        console.log(err)
    }
    }

export default connectDB;
    