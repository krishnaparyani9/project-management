import { Router } from "express";
import {
	createGroup, getMyGroup, getMyInvites,
	inviteStudent, respondToInvite, cancelInvite,
	removeMember, leaveGroup, updateGroup, deleteGroup,
	getGuideGroups,
	assignGuide, getAllGroups, getAllGuides
} from "../controllers/group.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Specific static paths MUST come before /:id param routes
router.get("/my",          authenticate, authorizeRoles("student"), getMyGroup);
router.get("/invites",     authenticate, authorizeRoles("student"), getMyInvites);
router.get("/guide",       authenticate, authorizeRoles("guide"),   getGuideGroups);
router.get("/all",         authenticate, authorizeRoles("admin"),   getAllGroups);
router.get("/guides-list", authenticate, authorizeRoles("admin"),   getAllGuides);

// Student: create group
router.post("/", authenticate, authorizeRoles("student"), createGroup);

// Student owner: manage own group
router.patch("/:id",                        authenticate, authorizeRoles("student"), updateGroup);
router.delete("/:id",                       authenticate, authorizeRoles("student"), deleteGroup);
router.delete("/:id/leave",                 authenticate, authorizeRoles("student"), leaveGroup);
router.post("/:id/invites",                 authenticate, authorizeRoles("student"), inviteStudent);
router.post("/:id/invites/respond",         authenticate, authorizeRoles("student"), respondToInvite);
router.delete("/:id/invites/:studentId",    authenticate, authorizeRoles("student"), cancelInvite);
router.delete("/:id/members/:memberId",     authenticate, authorizeRoles("student"), removeMember);

// Admin: guide assignment
router.post("/:id/assign-guide", authenticate, authorizeRoles("admin"), assignGuide);

export default router;
