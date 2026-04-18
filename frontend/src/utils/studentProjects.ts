import type { StudentProject } from "../types/project.types";

const getStorageKey = (userId?: string) => `student-projects:${userId ?? "anonymous"}`;

const isValidProject = (item: unknown): item is StudentProject => {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<StudentProject>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.subjectId === "string" &&
    typeof candidate.subjectName === "string" &&
    typeof candidate.guideName === "string" &&
    typeof candidate.createdAt === "string"
  );
};

export const loadStudentProjects = (userId?: string): StudentProject[] => {
  const rawValue = localStorage.getItem(getStorageKey(userId));
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidProject);
  } catch {
    return [];
  }
};

export const saveStudentProjects = (userId: string | undefined, projects: StudentProject[]) => {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(projects));
};

export const findStudentProjectById = (userId: string | undefined, projectId: string) =>
  loadStudentProjects(userId).find((project) => project.id === projectId) ?? null;

export const updateStudentProjectById = (
  userId: string | undefined,
  projectId: string,
  updater: (project: StudentProject) => StudentProject
) => {
  const current = loadStudentProjects(userId);
  let updated = false;

  const next = current.map((project) => {
    if (project.id !== projectId) return project;
    updated = true;
    return updater(project);
  });

  if (!updated) return null;

  saveStudentProjects(userId, next);
  return next.find((project) => project.id === projectId) ?? null;
};
