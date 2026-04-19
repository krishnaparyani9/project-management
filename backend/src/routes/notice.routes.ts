import { Router } from "express";
import { sendNotice } from "../controllers/notice.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.post("/send", authenticate, authorizeRoles("admin"), sendNotice);

export default router;
