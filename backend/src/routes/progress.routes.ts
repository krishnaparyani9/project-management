import { Router } from "express";
import { getGuideProgressUpdates, getMyProgressUpdates } from "../controllers/progress.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get("/my", authenticate, getMyProgressUpdates);
router.get("/guide", authenticate, authorizeRoles("guide"), getGuideProgressUpdates);

export default router;
