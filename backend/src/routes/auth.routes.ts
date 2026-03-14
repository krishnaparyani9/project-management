import { Router } from "express";
import { login, logout, me, signup } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", signup);
router.post("/login", login);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

export default router;
