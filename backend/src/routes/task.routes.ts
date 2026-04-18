import { Router } from "express";
import { createGuideTask, getGuideTasks, getMyTasks, updateMyTaskStatus } from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get("/my", authenticate, getMyTasks);
router.get("/guide", authenticate, authorizeRoles("guide"), getGuideTasks);
router.post("/", authenticate, authorizeRoles("guide"), createGuideTask);
router.patch("/:id/status", authenticate, authorizeRoles("student"), updateMyTaskStatus);

export default router;
