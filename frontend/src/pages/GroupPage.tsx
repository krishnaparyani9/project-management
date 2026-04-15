import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Input from "../components/Input";
import {
  fetchMyGroup, fetchMyInvites, createGroup, updateGroup, deleteGroup,
  leaveGroup, inviteStudent, respondToInvite, cancelInvite, removeMember,
  fetchGuideGroups, fetchAllGroups, fetchAllGuides, assignGuide,
  fetchAllGroupNames
} from "../services/group.api";
import type { ProjectGroup, PendingInvite } from "../types/group.types";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function errMsg(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? "Something went wrong.";
  }
  return "Something went wrong.";
}

function normalizeGroups(data: ProjectGroup | ProjectGroup[] | null | undefined): ProjectGroup[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-sm font-semibold text-blue-700 ring-1 ring-blue-200/60">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Guide status card ────────────────────────────────────────────────────────

function GuideStatusCard({ guide }: { guide: ProjectGroup["guide"] }) {
  if (!guide) {
    return (
      <article className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Guide Not Assigned</p>
        </div>
        <p className="mt-1 text-sm text-amber-700">
          Your group hasn&apos;t been assigned a guide yet. The admin will assign one shortly.
        </p>
      </article>
    );
  }
  return (
    <article className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Guide Assigned</p>
      </div>
      <p className="mt-1 text-base font-semibold text-slate-800">{guide.name}</p>
      <p className="text-sm text-slate-500">{guide.email}</p>
    </article>
  );
}

// ─── Student: no group yet ────────────────────────────────────────────────────

function NoGroupView({ invites, onAccept, onDecline, onOpenCreate }: {
  invites: PendingInvite[];
  onAccept: (groupId: string) => Promise<void>;
  onDecline: (groupId: string) => Promise<void>;
  onOpenCreate: () => void;
}) {
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const respond = async (groupId: string, action: "accept" | "decline") => {
    setRespondingId(groupId);
    try {
      if (action === "accept") await onAccept(groupId);
      else await onDecline(groupId);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Groups</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-strong)]">Project Groups</h2>
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Pending Invites
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{invites.length}</span>
          </h3>
          {invites.map((inv) => (
            <div key={inv.groupId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200/70 bg-white p-4 shadow-sm shadow-blue-100/40">
              <div>
                <p className="text-base font-semibold text-slate-800">{inv.groupName}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Invited by <span className="font-medium">{inv.owner.name}</span>
                  &nbsp;·&nbsp; {inv.memberCount}/4 members
                  &nbsp;·&nbsp; Subject: {inv.subject}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  disabled={respondingId === inv.groupId}
                  onClick={() => void respond(inv.groupId, "accept")}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  Accept
                </button>
                <button
                  disabled={respondingId === inv.groupId}
                  onClick={() => void respond(inv.groupId, "decline")}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Empty state */}
      <section className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-[var(--bg-2)]/90 to-[var(--bg-1)]/80 p-8 shadow-lg">
        <h3 className="text-base font-semibold text-[var(--text-strong)]">No Groups Yet</h3>
        <p className="mt-1 text-sm text-[var(--text-body)]">
          Create your first group and invite up to 3 teammates. Each group can have up to 4 members.
        </p>
        <div className="mt-4">
          <Button onClick={onOpenCreate}>Create Group</Button>
        </div>
      </section>
    </div>
  );
}

// ─── Student: has a group ─────────────────────────────────────────────────────

function MyGroupView({ group, userId, onUpdate, onLeft, onDeleted }: {
  group: ProjectGroup;
  userId: string;
  onUpdate: (g: ProjectGroup) => void;
  onLeft: (groupId: string) => void;
  onDeleted: (groupId: string) => void;
}) {
  const isOwner = group.owner.id === userId;

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteErr, setInviteErr] = useState("");
  const [inviting, setInviting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [editSubject, setEditSubject] = useState(group.subject);
  const [editErr, setEditErr] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [actionErr, setActionErr] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteErr("");
    setInviting(true);
    try {
      const res = await inviteStudent(group.id, inviteEmail.trim());
      onUpdate(res.data.data);
      setInviteEmail("");
    } catch (err) {
      setInviteErr(errMsg(err));
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (studentId: string) => {
    setActionErr("");
    try {
      const res = await cancelInvite(group.id, studentId);
      onUpdate(res.data.data);
    } catch (err) {
      setActionErr(errMsg(err));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setActionErr("");
    try {
      const res = await removeMember(group.id, memberId);
      onUpdate(res.data.data);
    } catch (err) {
      setActionErr(errMsg(err));
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubject.trim()) {
      setEditErr("Subject is required.");
      return;
    }
    setEditErr("");
    setEditLoading(true);
    try {
      const res = await updateGroup(group.id, { name: editName.trim(), subject: editSubject.trim() });
      onUpdate(res.data.data);
      setEditOpen(false);
    } catch (err) {
      setEditErr(errMsg(err));
    } finally {
      setEditLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionErr("");
    try {
      await leaveGroup(group.id);
      onLeft(group.id);
    } catch (err) {
      setActionErr(errMsg(err));
    }
  };

  const handleDelete = async () => {
    setActionErr("");
    setDeleteLoading(true);
    try {
      await deleteGroup(group.id);
      onDeleted(group.id);
      setShowDeleteConfirm(false);
      setShowDetails(false);
    } catch (err) {
      setActionErr(errMsg(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const spotsLeft = 4 - group.members.length;

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setShowDetails(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowDetails(true);
          }
        }}
        className="cursor-pointer rounded-2xl border border-blue-400/30 bg-[#23293a] p-6 shadow-xl transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-2xl"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-400">Group</p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-strong)]">{group.name}</h3>
        <p className="mt-1 text-sm text-[var(--text-body)]">Subject: {group.subject}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-blue-400">
          <span>{group.members.length}/4 Members</span>
          <span>{group.guide ? "Guide Assigned" : "Guide Not Assigned"}</span>
        </div>
      </article>

      <Modal open={showDetails} title={`Group Details - ${group.name}`} onClose={() => setShowDetails(false)}>
        <div className="space-y-4">
          {actionErr && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{actionErr}</p>}

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Group</p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-strong)]">{group.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-body)]">Subject: {group.subject}</p>
            </div>
            {isOwner && (
              <button
                onClick={() => { setEditName(group.name); setEditSubject(group.subject); setEditOpen(true); }}
                className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 transition"
              >
                Edit
              </button>
            )}
          </div>

          <GuideStatusCard guide={group.guide} />

          <section className="rounded-lg border border-blue-400/30 bg-[#2a3144] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-strong)]">
                Team Members
                <span className="ml-2 text-xs font-normal text-blue-300">{group.members.length}/4</span>
              </h3>
              {spotsLeft === 0
                ? <span className="rounded-full bg-blue-400/10 px-2 py-0.5 text-xs text-blue-300">Full</span>
                : <span className="text-xs text-blue-300">{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</span>
              }
            </div>
            <ul className="space-y-2">
              {group.members.map((member) => (
                <li key={member.id} className="flex items-center justify-between rounded-lg border border-blue-400/10 bg-[#23293a] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--text-strong)]">{member.name}</p>
                        {member.id === group.owner.id && (
                          <span className="rounded bg-blue-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">Owner</span>
                        )}
                      </div>
                      <p className="text-xs text-blue-200">{member.email}</p>
                    </div>
                  </div>
                  {isOwner && member.id !== userId && (
                    <button
                      onClick={() => void handleRemoveMember(member.id)}
                      className="text-xs text-rose-400 hover:text-rose-600 transition"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {isOwner && (
            <section className="rounded-lg border border-blue-400/30 bg-[#2a3144] p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--text-strong)]">Invite Teammates</h3>

              {spotsLeft > 0 ? (
                <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => void handleInvite(e)}>
                  <input
                    type="email"
                    placeholder="Enter student email..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-blue-400/10 bg-[#23293a] px-3 py-2.5 text-sm text-[var(--text-body)] shadow-sm outline-none ring-blue-400 transition focus:border-blue-400 focus:ring"
                  />
                  <Button type="submit" disabled={inviting}>{inviting ? "Sending..." : "Send Invite"}</Button>
                </form>
              ) : (
                <p className="text-sm text-blue-300">Group is full (4/4 members).</p>
              )}

              {inviteErr && <p className="mt-2 text-sm text-rose-400">{inviteErr}</p>}

              {group.pendingInvites.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-300">
                    Pending ({group.pendingInvites.length})
                  </p>
                  <ul className="space-y-2">
                    {group.pendingInvites.map((s) => (
                      <li key={s.id} className="flex items-center justify-between rounded-lg border border-dashed border-blue-400/20 bg-[#23293a] px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-strong)]">{s.name}</p>
                          <p className="text-xs text-blue-200">{s.email}</p>
                        </div>
                        <button
                          onClick={() => void handleCancelInvite(s.id)}
                          className="text-xs text-blue-300 hover:text-rose-400 transition"
                        >
                          Cancel
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <div className="flex justify-end">
            {isOwner ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                Delete Group
              </button>
            ) : (
              <button
                onClick={() => void handleLeave()}
                className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                Leave Group
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={editOpen} title="Edit Group" onClose={() => setEditOpen(false)}>
        <form className="space-y-4" onSubmit={(e) => void handleEdit(e)}>
          <Input id="e-name" label="Group Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          <Input id="e-subject" label="Subject" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} required />
          {editErr && <p className="text-sm text-rose-600">{editErr}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" className="border-gray-200 bg-white text-slate-600 hover:bg-gray-50" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showDeleteConfirm} title="Confirm Delete" onClose={() => setShowDeleteConfirm(false)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-800">{group.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              className="border-gray-200 bg-white text-slate-600 hover:bg-gray-50"
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button variant="danger" type="button" onClick={() => void handleDelete()} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Student page (orchestrates no-group / has-group) ─────────────────────────

function StudentGroupPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [createErr, setCreateErr] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [allGroupNames, setAllGroupNames] = useState<{ name: string; branch: string; division: string; subject?: string }[]>([]);
  // Compute available group numbers for dropdown
  const branch = user?.branch || "";
  const division = user?.division || "";
  const groupPrefix = `${branch}-${division}-`;
  const takenNumbers = allGroupNames
    .filter(g => g.branch === branch && g.division === division && g.name.startsWith(groupPrefix))
    .map(g => parseInt(g.name.replace(groupPrefix, ""), 10))
    .filter(n => !isNaN(n));
  const availableNumbers = Array.from({ length: 21 }, (_, i) => i).filter(n => !takenNumbers.includes(n));

  useEffect(() => {
    const load = async () => {
      try {
        const [groupRes, invitesRes, allGroupNamesRes] = await Promise.all([
          fetchMyGroup(),
          fetchMyInvites(),
          fetchAllGroupNames()
        ]);
        const myGroups = normalizeGroups(groupRes.data.data as ProjectGroup | ProjectGroup[] | null);
        setGroups(myGroups);
        setInvites(invitesRes.data.data);
        setAllGroupNames(allGroupNamesRes.data.data);
      } catch (err) {
        setError(errMsg(err));
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const handleAccept = async (groupId: string) => {
    const res = await respondToInvite(groupId, "accept");
    if (res.data.data.joined) {
      const groupRes = await fetchMyGroup();
      const myGroups = normalizeGroups(groupRes.data.data as ProjectGroup | ProjectGroup[] | null);
      setGroups(myGroups);
      setInvites([]);
    }
  };

  const handleDecline = async (groupId: string) => {
    await respondToInvite(groupId, "decline");
    setInvites((prev) => prev.filter((i) => i.groupId !== groupId));
  };

  const handleCreateAnother = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setCreateErr("Group name is required."); return; }
    if (!newSubject.trim()) { setCreateErr("Subject is required."); return; }
    setCreateErr("");
    setCreateLoading(true);
    try {
      const res = await createGroup({ name: newName.trim(), subject: newSubject.trim() });
      setGroups((prev) => [res.data.data, ...prev]);
      setNewName("");
      setNewSubject("");
      setShowCreate(false);
    } catch (err) {
      setCreateErr(errMsg(err));
    } finally {
      setCreateLoading(false);
    }
  };

  if (isLoading) return <p className="text-sm text-slate-500">Loading...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  if (groups.length === 0) {
    return (
      <>
        <NoGroupView
          invites={invites}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onOpenCreate={() => { setCreateErr(""); setShowCreate(true); }}
        />
        <Modal open={showCreate} title="Create Group" onClose={() => setShowCreate(false)}>
          <form className="space-y-4" onSubmit={(e) => void handleCreateAnother(e)}>
            {/* Show branch and division info above the group name dropdown */}
            <div className="mb-2">
              <span className="block text-xs text-blue-400">Branch:</span>
              <span className="block text-sm font-semibold text-[var(--text-strong)]">{branch || <span className="text-rose-400">Not set</span>}</span>
              <span className="block text-xs text-blue-400 mt-1">Division:</span>
              <span className="block text-sm font-semibold text-[var(--text-strong)]">{division || <span className="text-rose-400">Not set</span>}</span>
            </div>
            <label htmlFor="cg-name-empty" className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">Group Name</span>
              <select
                id="cg-name-empty"
                className="w-full rounded-lg border border-blue-400/30 bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-blue-400 transition focus:border-blue-400 focus:ring"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                disabled={!branch || !division}
              >
                <option value="">{!branch || !division ? "Set branch and division in your profile" : "Select Group"}</option>
                {branch && division && availableNumbers.map(n => (
                  <option key={n} value={`${branch}-${division}-${n}`}>{`${branch}-${division}-${n}`}</option>
                ))}
              </select>
            </label>
            {/* Fallback/error if branch or division is missing */}
            {(!branch || !division) && (
              <p className="text-sm text-rose-600 mt-2">Branch and division must be set in your profile to create a group.</p>
            )}
            <label htmlFor="cg-subject-empty" className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">Subject</span>
              <select
                id="cg-subject-empty"
                className="w-full rounded-lg border border-blue-400/30 bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-blue-400 transition focus:border-blue-400 focus:ring"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                required
              >
                <option value="">Select Subject</option>
                <option value="EDI">EDI</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
              </select>
            </label>
            {createErr && <p className="text-sm text-rose-600">{createErr}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" className="border-gray-200 bg-white text-slate-600 hover:bg-gray-50" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createLoading}>{createLoading ? "Creating..." : "Create Group"}</Button>
            </div>
          </form>
        </Modal>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Your Groups</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-strong)]">My Groups</h2>
          <p className="mt-1 text-sm text-[var(--text-body)]">Manage your groups, invites, and team members.</p>
        </div>
        <Button onClick={() => { setCreateErr(""); setShowCreate(true); }}>Create Group</Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <MyGroupView
            key={group.id}
            group={group}
            userId={user?.id ?? ""}
            onUpdate={(updated) => setGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g))}
            onLeft={(groupId) => setGroups((prev) => prev.filter((g) => g.id !== groupId))}
            onDeleted={(groupId) => setGroups((prev) => prev.filter((g) => g.id !== groupId))}
          />
        ))}
      </div>

      <Modal open={showCreate} title="Create Group" onClose={() => setShowCreate(false)}>
        <form className="space-y-4" onSubmit={(e) => void handleCreateAnother(e)}>
          {/* Show branch and division info above the group name dropdown */}
          <div className="mb-2">
            <span className="block text-xs text-slate-500">Branch:</span>
            <span className="block text-sm font-semibold text-slate-700">{branch || <span className="text-rose-600">Not set</span>}</span>
            <span className="block text-xs text-slate-500 mt-1">Division:</span>
            <span className="block text-sm font-semibold text-slate-700">{division || <span className="text-rose-600">Not set</span>}</span>
          </div>
          <label htmlFor="cg-name" className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Group Name</span>
            <select
              id="cg-name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-blue-300 transition focus:ring"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              disabled={!branch || !division}
            >
              <option value="">{!branch || !division ? "Set branch and division in your profile" : "Select Group"}</option>
              {branch && division && availableNumbers.map(n => {
                const groupValue = `${branch}-${division}-${n}`;
                // Check if this group number is already taken for the selected subject
                const taken = allGroupNames.some(g => g.name === groupValue && newSubject && g.subject === newSubject);
                return (
                  <option
                    key={n}
                    value={groupValue}
                    disabled={taken}
                  >
                    {groupValue}
                    {taken ? ' (Taken)' : ''}
                  </option>
                );
              })}
            </select>
          </label>
          {/* Fallback/error if branch or division is missing */}
          {(!branch || !division) && (
            <p className="text-sm text-rose-600 mt-2">Branch and division must be set in your profile to create a group.</p>
          )}
          <label htmlFor="cg-subject" className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Subject</span>
            <select
              id="cg-subject"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-blue-300 transition focus:ring"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              required
            >
              <option value="">Select Subject</option>
              <option value="EDI">EDI</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
            </select>
          </label>
          {createErr && <p className="text-sm text-rose-600">{createErr}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" className="border-gray-200 bg-white text-slate-600 hover:bg-gray-50" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={createLoading}>{createLoading ? "Creating..." : "Create Group"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Guide page: read-only list of assigned groups ────────────────────────────

function GuideGroupPage() {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGuideGroups()
      .then((res) => setGroups(res.data.data))
      .catch((err: unknown) => setError(errMsg(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-sm text-slate-500">Loading your groups...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Assigned to you</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">My Groups</h2>
      </div>
      {groups.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-slate-400">No groups assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((g) => (
            <article key={g.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800">{g.name}</h3>
              <p className="mt-3 text-xs text-slate-500">Owner: {g.owner.name}</p>
              <ul className="mt-3 space-y-1">
                {g.members.map((m) => (
                  <li key={m.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Avatar name={m.name} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.email}</p>
                        <p className="text-xs text-slate-500">
                          Branch: {m.branch ?? "-"} · Division: {m.division ?? "-"} · Roll No: {m.rollNo ?? "-"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin page: all groups + assign guide ────────────────────────────────────

function AdminGroupPage() {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [guides, setGuides] = useState<{ id: string; name: string; email: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignTarget, setAssignTarget] = useState<ProjectGroup | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignErr, setAssignErr] = useState("");

  useEffect(() => {
    Promise.all([fetchAllGroups(), fetchAllGuides()])
      .then(([gr, gd]) => { setGroups(gr.data.data); setGuides(gd.data.data); })
      .catch((err: unknown) => setError(errMsg(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTarget) return;
    setAssignErr("");
    setAssigning(true);
    try {
      const res = await assignGuide(assignTarget.id, selectedGuideId || null);
      setGroups((prev) => prev.map((g) => g.id === assignTarget.id ? res.data.data : g));
      setAssignTarget(null);
    } catch (err) {
      setAssignErr(errMsg(err));
    } finally {
      setAssigning(false);
    }
  };

  if (isLoading) return <p className="text-sm text-slate-500">Loading all groups...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Admin Panel</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">All Project Groups</h2>
        <p className="mt-1 text-sm text-slate-500">Review groups and assign guides.</p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-slate-400">No groups have been created yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map((g) => (
            <article key={g.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{g.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Owner: {g.owner.name} · {g.members.length}/4 members
                  </p>
                </div>
                <button
                  onClick={() => { setAssignTarget(g); setSelectedGuideId(g.guide?.id ?? ""); setAssignErr(""); }}
                  className="shrink-0 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  {g.guide ? "Change Guide" : "Assign Guide"}
                </button>
              </div>
              <div className="mt-3">
                <GuideStatusCard guide={g.guide} />
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={!!assignTarget}
        title={`Assign Guide — ${assignTarget?.name ?? ""}`}
        onClose={() => setAssignTarget(null)}
      >
        <form className="space-y-4" onSubmit={(e) => void handleAssign(e)}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Select Guide</span>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-blue-300 transition focus:ring"
              value={selectedGuideId}
              onChange={(e) => setSelectedGuideId(e.target.value)}
            >
              <option value="">— Remove / Unassign —</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.email})</option>
              ))}
            </select>
          </label>
          {assignErr && <p className="text-sm text-rose-600">{assignErr}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" className="border-gray-200 bg-white text-slate-600 hover:bg-gray-50" type="button" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={assigning}>{assigning ? "Saving..." : "Confirm"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const GroupPage = () => {
  const { user } = useAuth();
  if (user?.role === "guide") return <GuideGroupPage />;
  if (user?.role === "admin") return <AdminGroupPage />;
  return <StudentGroupPage />;
};

export default GroupPage;
