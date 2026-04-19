import api from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type NoticeAudience = "students" | "guides" | "both";

export interface SendNoticePayload {
  audience: NoticeAudience;
  subject: string;
  message: string;
}

export interface SendNoticeResult {
  audience: NoticeAudience;
  requestedRecipients: number;
  delivered: number;
  failedBatches: number;
}

export const sendNotice = (payload: SendNoticePayload) =>
  api.post<ApiResponse<SendNoticeResult>>("/notices/send", payload);
