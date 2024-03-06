import mongoose from "mongoose";

const URI = process.env.MONGO_URI as string

mongoose.connect(URI).then(()=>{
    console.log('db is connected');
}).catch((err)=>{
    console.log("db connection failed: ", err);
})