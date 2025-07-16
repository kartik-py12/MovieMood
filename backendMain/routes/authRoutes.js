import express from "express";
import { register,login,logout,getMe } from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/auth.js";


const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isAuthenticated, getMe);

export default router;
