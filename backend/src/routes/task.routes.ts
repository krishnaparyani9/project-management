import { Router } from "express";
import { getGuideTasks, getMyTasks } from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get("/my", authenticate, getMyTasks);
router.get("/guide", authenticate, authorizeRoles("guide"), getGuideTasks);

export default router;
