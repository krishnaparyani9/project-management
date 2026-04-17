"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const group_controller_1 = require("../controllers/group.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Specific static paths MUST come before /:id param routes
router.get("/my", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.getMyGroup);
router.get("/invites", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.getMyInvites);
router.get("/guide", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("guide"), group_controller_1.getGuideGroups);
router.get("/all", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("admin"), group_controller_1.getAllGroups);
router.get("/all-public", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student", "guide", "admin"), group_controller_1.getAllGroupNames);
router.get("/guides-list", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("admin"), group_controller_1.getAllGuides);
// Student: create group
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.createGroup);
// Student owner: manage own group
router.patch("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.updateGroup);
router.delete("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.deleteGroup);
router.delete("/:id/leave", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.leaveGroup);
router.post("/:id/register-edi", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.registerEdiGroup);
router.post("/:id/invites", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.inviteStudent);
router.post("/:id/invites/respond", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.respondToInvite);
router.delete("/:id/invites/:studentId", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.cancelInvite);
router.delete("/:id/members/:memberId", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("student"), group_controller_1.removeMember);
// Admin: guide assignment
router.post("/:id/assign-guide", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("admin"), group_controller_1.assignGuide);
router.post("/:id/assign-cp-guide", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)("admin"), group_controller_1.assignCpGuide);
exports.default = router;
