export interface ProgressUpdate {
  id: string;
  summary: string;
  completionPercent: number;
  documentationUrl?: string;
  createdAt: string;
}