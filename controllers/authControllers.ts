import { Request, Response } from "express";
import User from "../models/User";
import Web3 from "web3";
import jwt from "jsonwebtoken"

const web3 = new Web3();

export async function getNonce(req: Request, res: Response) {
    const { walletAddress } = req.body;
    let user = await User.findOne({ walletAddress });

    if (!user) {
        user = new User({
            walletAddress,
            nonce: Math.floor(Math.random() * 1000000)
        });
        await user.save();
    } else {
        user.nonce = Math.floor(Math.random() * 1000000);
        await user.save();
    }

    res.json({ nonce: user.nonce });
}

export async function login(req: Request, res: Response) {
    const { walletAddress, signedMessage } = req.body;

    const user = await User.findOne({ walletAddress });
    if (!user) return res.status(401).send('User not found');

    try {
        const recoveredAddress = await web3.eth.personal.ecRecover(user.nonce.toString(), signedMessage);

        if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
            const token = jwt.sign({ walletAddress }, 'your-secret-key', { expiresIn: '1h' });

            res.json({ token });
        } else {
            res.status(401).send('Signature verification failed');
        }
    } catch (error) {
        console.error("Signature verification error:", error);
        res.status(500).send('Internal server error');
    }
}