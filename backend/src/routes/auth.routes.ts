import { Router } from "express";
import { login, logout, me, signup, googleLogin, updateProfile } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", authenticate, me);
router.patch("/profile", authenticate, authorizeRoles("guide"), updateProfile);
router.post("/logout", authenticate, logout);

export default router;
