import type { Task } from "../types/task.types";

export type GitHubCommit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

export type TaskCommitLink<TTask> = {
  task: TTask;
  commits: GitHubCommit[];
};

export const parseRepoFromUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host !== "github.com" && host !== "www.github.com") return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/i, "");
    if (!owner || !repo) return null;

    return { owner, repo };
  } catch {
    return null;
  }
};

export const fetchAllCommits = async (owner: string, repo: string, token?: string) => {
  const all: GitHubCommit[] = [];

  for (let page = 1; page <= 5; page += 1) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("GitHub API rate limit reached. Please try again later.");
      }
      if (response.status === 404) {
        throw new Error(
          token
            ? "Repository not found. Check the GitHub owner/repo URL and token access."
            : "Repository not found or private. Check owner/repo URL, or add a GitHub token for private repos."
        );
      }
      throw new Error("Unable to load commits from GitHub. Check repository visibility and URL.");
    }

    const payload = (await response.json()) as Array<{
      sha: string;
      html_url: string;
      commit: { message: string; author: { name: string; date: string } };
    }>;

    const mapped = payload.map((item) => ({
      sha: item.sha,
      message: item.commit.message,
      author: item.commit.author?.name ?? "Unknown",
      date: item.commit.author?.date ?? "",
      url: item.html_url
    }));

    all.push(...mapped);

    if (payload.length < 100) break;
  }

  return all;
};

const tokenize = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4);

const unique = (arr: string[]) => Array.from(new Set(arr));

export const mapTasksToCommits = <TTask extends Pick<Task, "title" | "description"> & { id?: string }>(tasks: TTask[], commits: GitHubCommit[]): TaskCommitLink<TTask>[] => {
  return tasks.map((task) => {
    const titleTokens = tokenize(task.title);
    const descriptionTokens = tokenize(task.description).slice(0, 6);
    const keywords = unique([...titleTokens.slice(0, 6), ...descriptionTokens]);

    const linked = commits.filter((commit) => {
      const message = commit.message.toLowerCase();
      
      // Primary: exact TASK-ID match (e.g., TASK-507f or task-507f)
      if (task.id) {
        const taskIdPattern = `task-${task.id.slice(-4).toLowerCase()}`;
        if (message.includes(taskIdPattern)) return true;
      }
      
      // Fallback: title or keyword matching
      if (message.includes(task.title.toLowerCase())) return true;
      return keywords.some((keyword) => message.includes(keyword));
    });

    return { task, commits: linked };
  });
}

export const getContributionSummary = (commits: GitHubCommit[]) => {
  const map = new Map<string, number>();

  for (const commit of commits) {
    const key = commit.author || "Unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count);
};
