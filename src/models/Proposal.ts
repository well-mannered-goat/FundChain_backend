import mongoose from "../database/connect";
import Review from "./Review";
const ProposalSchema = new mongoose.Schema({
    proposer: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    regions: [
        {
            type: Number,
            required: true,
        },
    ],
    status: {
        type: String,
        required: true,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Review,
        },
    ] 
});
const Proposal = mongoose.model('Proposal', ProposalSchema);
export default Proposal;