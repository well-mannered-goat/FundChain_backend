import { isHexString } from "ethers";
import mongoose from "../database/connect";

const UserSchema=new mongoose.Schema({
    name:{
        type: String,
        required:true,
    },
    walletAddress:{
        type: String,
        unique:true,
        required:true,
    },
    nonce:{
        type:Number,
        required:true
    }
})

const User=mongoose.model('User',UserSchema);

export default User;