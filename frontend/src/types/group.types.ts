import type { User } from "./user.types";

export interface ProjectGroup {
  id: string;
  name: string;
  guide: Pick<User, "name" | "email">;
  members: Array<Pick<User, "name" | "email" | "role">>;
  milestone: string;
}
