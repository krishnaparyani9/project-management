import { Router } from "express";
import { addSubject, getAllSubjects, removeSubject } from "../controllers/subject.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, getAllSubjects);
router.post("/", authenticate, authorizeRoles("admin"), addSubject);
router.delete("/:id", authenticate, authorizeRoles("admin"), removeSubject);

export default router;
