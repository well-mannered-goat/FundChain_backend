import { Request, Response } from 'express';
import User from '../models/User';
import Proposal from '../models/Proposal';
import Review from '../models/Review';
export async function getReviewUsers( req: Request, res: Response ) {
    const proposalID = req.body.proposalID;
    const proposal = await Proposal.findOne({proposalId: proposalID});
    if(!proposal){
        return res.status(404).send("Proposal not found");
    }
    let users = [];
    try {
        users = await User.aggregate([
            {
                $match: {
                    regions: { $in: proposal.regions }
                }
            },
        ]).exec();
        // Get 25% Random Users from the list
        const randomUsers = users.sort(() => Math.random() - Math.random()).slice(0, Math.floor(users.length / 4));
        randomUsers.forEach(async (user) => {
            user.pendingReviews.push(proposal);
        });
        User.updateMany({ _id: { $in: randomUsers.map((user) => user._id) } }, { pendingReviews: randomUsers.map((user) => user.pendingReviews) });
        return res.status(200).send("Users selected for review");
    } catch (err) {
        return res.status(500).send("Error in finding users");
    }
}
export async function submitReview( req: Request, res: Response ) {
    const proposalID = req.body.proposalID;
    const rating = req.body.rating;
    const comment = req.body.comment;
    const user = req.user;
    const proposal = await Proposal.findOne({proposalId: proposalID});
    if(!proposal){
        return res.status(404).send("Proposal not found");
    }
    if(!user || !user.pendingReviews.includes(proposalID)){
        return res.status(400).send("User not selected for review");
    }
    const review = {
        proposalId: proposalID,
        rating: rating,
        comment: comment
    };
    const newReview = new Review(review);
    try {
        await newReview.save();
        proposal.reviews.push(newReview._id);
        await proposal.save();
        user.pendingReviews = user.pendingReviews.filter((review) => review !== proposalID);
        await user.save();
        // Send reward to the user
        return res.status(200).send("Review submitted successfully");
    } catch (err) {
        return res.status(500).send("Error in submitting review");
    }
}