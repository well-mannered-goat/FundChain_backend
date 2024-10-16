import { Request, Response } from 'express';
import User from '../models/User';
import Proposal from '../models/Proposal';
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
            // Send review to the user
        });
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
    const review = {
        proposalId: proposalID,
        rating: rating,
        comment: comment
    };
    const newReview = new Review(review);
    try {
        await newReview.save();
        proposal.reviews.push(newReview);
        await proposal.save();
        // Send reward to the user
        return res.status(200).send("Review submitted successfully");
    } catch (err) {
        return res.status(500).send("Error in submitting review");
    }
}