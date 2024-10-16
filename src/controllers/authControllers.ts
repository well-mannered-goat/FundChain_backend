import { Request, Response } from "express";

import User from "../models/User";
import Web3 from "web3";
import jwt from "jsonwebtoken"

const web3 = new Web3();
declare module 'express-serve-static-core' {
    interface Request {
        user?: InstanceType<typeof User>;
    }
}
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
            if (!process.env.SECRET_KEY) {
                throw new Error('SECRET_KEY is not defined');
            }
            const token = jwt.sign({ walletAddress }, process.env.SECRET_KEY, { expiresIn: '1h' });

            res.json({ token });
        } else {
            res.status(401).send('Signature verification failed');
        }
    } catch (error) {
        console.error("Signature verification error:", error);
        res.status(500).send('Internal server error');
    }
}

export async function isLoggedIn(req: Request, res: Response, next: Function) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY is not defined');
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY) as { walletAddress: string };
        const user = await User.findOne({ walletAddress: decoded.walletAddress });

        if (!user) {
            return res.status(401).send('User not found.');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(400).send('Invalid token.');
    }
}