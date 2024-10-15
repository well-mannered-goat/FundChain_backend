import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI!)
.then(()=>{
    console.log("MongoDB connected")
})
.catch((err)=>{
    console.log("Error connecting MongoDB: ",err)
})

export default mongoose;