// ─── Public: view all group names, branch, division ─────────────────────────────
import type { Request } from "express";
export const getAllGroupNames = asyncHandler(async (_req: Request, res: Response) => {
	const groups = await ProjectGroupModel.find({}, { name: 1, _id: 0 })
		.populate({ path: "owner", select: "branch division" })
		.lean();
	// Each group: { name, owner: { branch, division } }
	const result = groups.map((g: any) => ({
		name: g.name,
		branch: g.owner?.branch || null,
		division: g.owner?.division || null
	}));
	res.status(200).json(new ApiResponse(true, "Group names fetched", result));
});
import type { Response } from "express";
import { Types } from "mongoose";
import { ProjectGroupModel } from "../models/projectGroup.model";
import { UserModel } from "../models/user.model";
import type { AuthenticatedRequest } from "../types/auth.types";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const POPULATE = [
	{ path: "owner", select: "name email" },
	{ path: "ediGuide", select: "name email" },
	{ path: "cpGuide", select: "name email" },
	{ path: "members", select: "name email role branch division rollNo" },
	{ path: "pendingInvites", select: "name email" }
];

type PopUser = {
	_id: unknown;
	name: string;
	email: string;
	role?: string;
	branch?: string;
	division?: string;
	rollNo?: string;
};
const fu = (u: PopUser) => ({
	id: String(u._id),
	name: u.name,
	email: u.email,
	branch: u.branch,
	division: u.division,
	rollNo: u.rollNo
});

const normalizeRepositoryUrl = (value: string) => value.trim().replace(/\/+$/, "");
const isValidGithubRepositoryUrl = (value: string) =>
	/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/i.test(value);

const formatGroup = (g: Record<string, unknown>) => ({
	id: String(g._id),
	name: g.name as string,
	subject: (g.subject as string) || "General",
	repositoryUrl: (g.repositoryUrl as string | null | undefined) ?? null,
	isEdiRegistered: Boolean(g.isEdiRegistered),
	owner: fu(g.owner as PopUser),
	guide: g.ediGuide ? fu(g.ediGuide as PopUser) : null,
	ediGuide: g.ediGuide ? fu(g.ediGuide as PopUser) : null,
	cpGuide: g.cpGuide ? fu(g.cpGuide as PopUser) : null,
	members: (g.members as PopUser[]).map((m) => ({ ...fu(m), role: m.role ?? "student" })),
	pendingInvites: (g.pendingInvites as PopUser[]).map(fu)
});

// ─── Student: create a group (becomes owner + first member) ──────────────────
export const createGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const ownerId = req.user!.userId;
	const { name, subject, repositoryUrl } = req.body as { name?: string; subject?: string; repositoryUrl?: string | null };
	const user = await UserModel.findById(ownerId).select("hasCreatedGroup").lean();
	const existingGroup = await ProjectGroupModel.exists({ $or: [{ owner: ownerId }, { members: ownerId }] });

	if (user?.hasCreatedGroup || existingGroup) {
		res.status(409).json(new ApiResponse(false, "You can create only one group", null));
		return;
	}

	if (!name?.trim()) {
		res.status(400).json(new ApiResponse(false, "Group name is required", null));
		return;
	}

	if (!subject?.trim()) {
		res.status(400).json(new ApiResponse(false, "Subject is required", null));
		return;
	}

	let normalizedRepositoryUrl: string | null = null;
	if (repositoryUrl && repositoryUrl.trim()) {
		normalizedRepositoryUrl = normalizeRepositoryUrl(repositoryUrl);
		if (!isValidGithubRepositoryUrl(normalizedRepositoryUrl)) {
			res.status(400).json(new ApiResponse(false, "Provide a valid GitHub repository URL", null));
			return;
		}
	}

	const group = await ProjectGroupModel.create({
		name: name.trim(),
		subject: subject.trim(),
		repositoryUrl: normalizedRepositoryUrl,
		isEdiRegistered: false,
		owner: new Types.ObjectId(ownerId),
		ediGuide: null,
		cpGuide: null,
		members: [new Types.ObjectId(ownerId)],
		pendingInvites: []
	});

	const populated = await group.populate(POPULATE);
	await UserModel.updateOne({ _id: ownerId }, { $set: { hasCreatedGroup: true } });
	res.status(201).json(new ApiResponse(true, "Group created", formatGroup(populated.toObject() as unknown as Record<string, unknown>)));
});

// ─── Student: fetch all groups where the user is a member ────────────────────
export const getMyGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user!.userId;

	const groups = await ProjectGroupModel.find({ members: userId }).populate(POPULATE).sort({ createdAt: -1 }).lean();

	res.status(200).json(
		new ApiResponse(true, "Groups fetched", groups.map((g) => formatGroup(g as unknown as Record<string, unknown>)))
	);
});

// ─── Student: fetch all pending invites sent to them ─────────────────────────
export const getMyInvites = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user!.userId;

	const groups = await ProjectGroupModel.find({ pendingInvites: userId })
		.populate("owner", "name email")
		.populate("members", "name email")
		.lean();

	const result = groups.map((g) => ({
		groupId: String(g._id),
		groupName: g.name,
		subject: g.subject || "General",
		owner: fu((g.owner as unknown) as PopUser),
		memberCount: (g.members as unknown[]).length
	}));

	res.status(200).json(new ApiResponse(true, "Invites fetched", result));
});

// ─── Student owner: invite a student by email ────────────────────────────────
export const inviteStudent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const ownerId = req.user!.userId;
	const { id } = req.params as { id: string };
	const { email } = req.body as { email?: string };

	if (!email?.trim()) {
		res.status(400).json(new ApiResponse(false, "Email is required", null));
		return;
	}

	const group = await ProjectGroupModel.findOne({ _id: id, owner: ownerId });
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Group not found or you are not the owner", null));
		return;
	}

	if (group.members.length >= 4) {
		res.status(400).json(new ApiResponse(false, "Group is full (maximum 4 members)", null));
		return;
	}

	const student = await UserModel.findOne({ email: email.trim().toLowerCase(), role: "student" });
	if (!student) {
		res.status(404).json(new ApiResponse(false, "No student account found with that email", null));
		return;
	}

	const studentId = String(student._id);

	if (studentId === ownerId) {
		res.status(400).json(new ApiResponse(false, "You cannot invite yourself", null));
		return;
	}

	if (group.members.some((m) => String(m) === studentId)) {
		res.status(409).json(new ApiResponse(false, "This student is already a member", null));
		return;
	}

	if (group.pendingInvites.some((i) => String(i) === studentId)) {
		res.status(409).json(new ApiResponse(false, "Invite already sent to this student", null));
		return;
	}

	group.pendingInvites.push(new Types.ObjectId(studentId));
	await group.save();

	const populated = await group.populate(POPULATE);
	res.status(200).json(new ApiResponse(true, "Invite sent", formatGroup(populated.toObject() as unknown as Record<string, unknown>)));
});

// ─── Student: accept or decline an invite ────────────────────────────────────
export const respondToInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const studentId = req.user!.userId;
	const { id } = req.params as { id: string };
	const { action } = req.body as { action?: string };

	if (action !== "accept" && action !== "decline") {
		res.status(400).json(new ApiResponse(false, "Action must be 'accept' or 'decline'", null));
		return;
	}

	const group = await ProjectGroupModel.findOne({ _id: id, pendingInvites: studentId });
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Invite not found", null));
		return;
	}

	if (action === "accept") {
		if (group.members.length >= 4) {
			res.status(400).json(new ApiResponse(false, "Group is now full", null));
			return;
		}
		group.pendingInvites = group.pendingInvites.filter((i) => String(i) !== studentId);
		group.members.push(new Types.ObjectId(studentId));
	} else {
		group.pendingInvites = group.pendingInvites.filter((i) => String(i) !== studentId);
	}

	await group.save();
	res.status(200).json(new ApiResponse(true, action === "accept" ? "Joined group successfully" : "Invite declined", { joined: action === "accept" }));
});

// ─── Student owner: cancel a pending invite ───────────────────────────────────
export const cancelInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const ownerId = req.user!.userId;
	const { id, studentId } = req.params as { id: string; studentId: string };

	const group = await ProjectGroupModel.findOne({ _id: id, owner: ownerId });
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Group not found or unauthorized", null));
		return;
	}

	group.pendingInvites = group.pendingInvites.filter((i) => String(i) !== studentId);
	await group.save();

	const populated = await group.populate(POPULATE);
	res.status(200).json(new ApiResponse(true, "Invite cancelled", formatGroup(populated.toObject() as unknown as Record<string, unknown>)));
});

// ─── Student owner: remove a member ──────────────────────────────────────────
export const removeMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const ownerId = req.user!.userId;
	const { id, memberId } = req.params as { id: string; memberId: string };

	if (memberId === ownerId) {
		res.status(400).json(new ApiResponse(false, "Owner cannot remove themselves. Delete the group instead.", null));
		return;
	}

	const group = await ProjectGroupModel.findOne({ _id: id, owner: ownerId });
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Group not found or unauthorized", null));
		return;
	}

	group.members = group.members.filter((m) => String(m) !== memberId);
	await group.save();

	const populated = await group.populate(POPULATE);
	res.status(200).json(new ApiResponse(true, "Member removed", formatGroup(populated.toObject() as unknown as Record<string, unknown>)));
});

// ─── Student member: leave group (non-owner only) ────────────────────────────
export const leaveGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user!.userId;
	const { id } = req.params as { id: string };

	const group = await ProjectGroupModel.findOne({ _id: id, members: userId });
	if (!group) {
		res.status(404).json(new ApiResponse(false, "You are not in this group", null));
		return;
	}

	if (String(group.owner) === userId) {
		res.status(400).json(new ApiResponse(false, "Group owner cannot leave. Delete the group instead.", null));
		return;
	}

	group.members = group.members.filter((m) => String(m) !== userId);
	await group.save();

	res.status(200).json(new ApiResponse(true, "Left group successfully", null));
});

// ─── Student owner: update group name / subject ──────────────────────────────
export const updateGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const ownerId = req.user!.userId;
	const { id } = req.params as { id: string };
	const { name, subject, repositoryUrl } = req.body as { name?: string; subject?: string; repositoryUrl?: string | null };

	const group = await ProjectGroupModel.findOne({ _id: id, owner: ownerId });
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Group not found or unauthorized", null));
		return;
	}

	if (name?.trim()) group.name = name.trim();
	if (subject?.trim()) group.subject = subject.trim();
	if (repositoryUrl !== undefined) {
		if (!repositoryUrl || !repositoryUrl.trim()) {
			group.repositoryUrl = null;
		} else {
			const normalizedRepositoryUrl = normalizeRepositoryUrl(repositoryUrl);
			if (!isValidGithubRepositoryUrl(normalizedRepositoryUrl)) {
				res.status(400).json(new ApiResponse(false, "Provide a valid GitHub repository URL", null));
				return;
			}
			group.repositoryUrl = normalizedRepositoryUrl;
		}
	}
	await group.save();

	const populated = await group.populate(POPULATE);
	res.status(200).json(new ApiResponse(true, "Group updated", formatGroup(populated.toObject() as unknown as Record<string, unknown>)));
});

// ─── Student owner: register group for EDI guide assignment ─────────────────
export const registerEdiGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const ownerId = req.user!.userId;
	const { id } = req.params as { id: string };

	const group = await ProjectGroupModel.findOne({ _id: id, owner: ownerId });
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Group not found or unauthorized", null));
		return;
	}

	if (group.isEdiRegistered) {
		const populatedGroup = await group.populate(POPULATE);
		res.status(200).json(new ApiResponse(true, "Group already registered for EDI", formatGroup(populatedGroup.toObject() as unknown as Record<string, unknown>)));
		return;
	}

	group.isEdiRegistered = true;
	await group.save();

	const populated = await group.populate(POPULATE);
	res.status(200).json(new ApiResponse(true, "Group registered for EDI successfully", formatGroup(populated.toObject() as unknown as Record<string, unknown>)));
});

// ─── Student owner: delete group ─────────────────────────────────────────────
export const deleteGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const ownerId = req.user!.userId;
	const { id } = req.params as { id: string };

	const group = await ProjectGroupModel.findOneAndDelete({ _id: id, owner: ownerId });
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Group not found or unauthorized", null));
		return;
	}

	res.status(200).json(new ApiResponse(true, "Group deleted", null));
});

// ─── Guide: view groups assigned to them ─────────────────────────────────────
export const getGuideGroups = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const guideId = req.user!.userId;

	const groups = await ProjectGroupModel.find({ ediGuide: guideId }).populate(POPULATE).sort({ createdAt: -1 }).lean();

	res.status(200).json(new ApiResponse(true, "Guide groups fetched", groups.map((g) => formatGroup(g as unknown as Record<string, unknown>))));
});

// ─── Admin: assign or unassign a guide to a group ────────────────────────────
export const assignGuide = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const { id } = req.params as { id: string };
	const { guideId } = req.body as { guideId?: string | null };

	const group = await ProjectGroupModel.findById(id);
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Group not found", null));
		return;
	}

	if (!group.isEdiRegistered) {
		res.status(400).json(new ApiResponse(false, "Group must be registered in EDI before guide assignment", null));
		return;
	}

	if (guideId) {
		if (!Types.ObjectId.isValid(guideId)) {
			res.status(400).json(new ApiResponse(false, "Invalid guide ID", null));
			return;
		}
		const guide = await UserModel.findOne({ _id: guideId, role: "guide" });
		if (!guide) {
			res.status(404).json(new ApiResponse(false, "Guide not found", null));
			return;
		}
		if (group.cpGuide && String(group.cpGuide) === guideId) {
			res.status(400).json(new ApiResponse(false, "EDI and Course Project guides must be different", null));
			return;
		}
		group.ediGuide = new Types.ObjectId(guideId);
	} else {
		group.ediGuide = undefined;
	}

	await group.save();
	const populated = await group.populate(POPULATE);
	res.status(200).json(new ApiResponse(true, "EDI guide assignment updated", formatGroup(populated.toObject() as unknown as Record<string, unknown>)));
});

// ─── Admin: assign or unassign a course project guide ───────────────────────
export const assignCpGuide = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const { id } = req.params as { id: string };
	const { guideId } = req.body as { guideId?: string | null };

	const group = await ProjectGroupModel.findById(id);
	if (!group) {
		res.status(404).json(new ApiResponse(false, "Group not found", null));
		return;
	}

	if (guideId) {
		if (!Types.ObjectId.isValid(guideId)) {
			res.status(400).json(new ApiResponse(false, "Invalid guide ID", null));
			return;
		}
		const guide = await UserModel.findOne({ _id: guideId, role: "guide" });
		if (!guide) {
			res.status(404).json(new ApiResponse(false, "Guide not found", null));
			return;
		}
		if (group.ediGuide && String(group.ediGuide) === guideId) {
			res.status(400).json(new ApiResponse(false, "EDI and Course Project guides must be different", null));
			return;
		}
		group.cpGuide = new Types.ObjectId(guideId);
	} else {
		group.cpGuide = undefined;
	}

	await group.save();
	const populated = await group.populate(POPULATE);
	res.status(200).json(new ApiResponse(true, "Course project guide assignment updated", formatGroup(populated.toObject() as unknown as Record<string, unknown>)));
});

// ─── Admin: view all groups ───────────────────────────────────────────────────
export const getAllGroups = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
	const groups = await ProjectGroupModel.find({ isEdiRegistered: true }).populate(POPULATE).sort({ createdAt: -1 }).lean();

	res.status(200).json(new ApiResponse(true, "EDI-registered groups fetched", groups.map((g) => formatGroup(g as unknown as Record<string, unknown>))));
});

// ─── Admin: list all guide users ─────────────────────────────────────────────
export const getAllGuides = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
	const guides = await UserModel.find({ role: "guide" }).select("name email").lean();
	res.status(200).json(new ApiResponse(true, "Guides fetched", guides.map((g) => ({ id: String(g._id), name: g.name, email: g.email }))));
});

