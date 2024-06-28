import express from "express";
import { registerUser } from "../controllers/user.controller.js";


const router = express();

router.post("/register", registerUser)


export default router;
