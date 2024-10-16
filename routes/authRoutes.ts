import { Router } from "express";
import { getNonce } from "../controllers/authControllers";

const router = Router();

router.post('/nonce', getNonce);
