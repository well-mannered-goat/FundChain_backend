import mongoose from "../database/connect";
const ReviewSchema = new mongoose.Schema({
    proposalId: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
});
const Review = mongoose.model('Review', ReviewSchema);
export default Review;