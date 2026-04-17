export interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: string;
  branch?: string;
  division?: string;
  rollNo?: string;
}

export interface GroupOwner {
  id: string;
  name: string;
  email: string;
}

export interface GuideUser {
  id: string;
  name: string;
  email: string;
  teachingSubjectIds?: string[];
}

export interface CourseProjectRegistration {
  subjectId: string;
  subjectName: string;
  labFaculty: GuideUser | null;
  registeredAt: string | null;
}

export interface PendingInviteStudent {
  id: string;
  name: string;
  email: string;
}

export interface ProjectGroup {
  id: string;
  name: string;
  subject: string;
  repositoryUrl?: string | null;
  isEdiRegistered: boolean;
  ediGuide: GuideUser | null;
  cpGuide: GuideUser | null;
  guide: GuideUser | null;
  courseProjectRegistrations: CourseProjectRegistration[];
  owner: GroupOwner;
  members: GroupMember[];
  pendingInvites: PendingInviteStudent[];
}

export interface PendingInvite {
  groupId: string;
  groupName: string;
  subject: string;
  owner: GroupOwner;
  memberCount: number;
}
