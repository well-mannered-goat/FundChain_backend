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
    },
    regions:[
        {
            type: Number,
            required:true
        }
    ],
    isAdmin:
    {
        type:Boolean,
        required:true,
        default:false
    },
    pendingReviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Proposal',
            unique:true
        }
    ]
})

const User=mongoose.model('User',UserSchema);
export default User;