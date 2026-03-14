import { Router } from "express";
import { getGuideGroups, getMyGroup } from "../controllers/group.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get("/my", authenticate, getMyGroup);
router.get("/guide", authenticate, authorizeRoles("guide"), getGuideGroups);

export default router;
