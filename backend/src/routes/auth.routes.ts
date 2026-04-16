import { Router } from "express";
import { login, logout, me, signup, googleLogin } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

export default router;
