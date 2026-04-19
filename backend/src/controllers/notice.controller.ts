import type { Response } from "express";
import nodemailer from "nodemailer";
import { UserModel } from "../models/user.model";
import type { AuthenticatedRequest } from "../types/auth.types";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";

type NoticeAudience = "students" | "guides" | "both";

const chunk = <T>(items: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

const toHtml = (message: string) =>
  `<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;

export const sendNotice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { audience, subject, message } = req.body as {
    audience?: NoticeAudience;
    subject?: string;
    message?: string;
  };

  if (!audience || !["students", "guides", "both"].includes(audience)) {
    res.status(400).json(new ApiResponse(false, "Audience must be students, guides, or both", null));
    return;
  }

  if (!subject?.trim()) {
    res.status(400).json(new ApiResponse(false, "Subject is required", null));
    return;
  }

  if (!message?.trim()) {
    res.status(400).json(new ApiResponse(false, "Message is required", null));
    return;
  }

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    res.status(500).json(new ApiResponse(false, "Email service is not configured on server", null));
    return;
  }

  const roles = audience === "both" ? ["student", "guide"] : [audience === "students" ? "student" : "guide"];
  const users = await UserModel.find({ role: { $in: roles } }).select("email").lean();
  const recipientEmails = [...new Set(users.map((user) => user.email?.trim().toLowerCase()).filter(Boolean))] as string[];

  if (recipientEmails.length === 0) {
    res.status(200).json(new ApiResponse(true, "No recipients found for selected audience", {
      audience,
      requestedRecipients: 0,
      delivered: 0,
      failedBatches: 0
    }));
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  const emailBatches = chunk(recipientEmails, 50);
  let delivered = 0;
  let failedBatches = 0;

  for (const emailBatch of emailBatches) {
    try {
      await transporter.sendMail({
        from: env.mailFrom,
        to: env.mailFrom,
        bcc: emailBatch,
        subject: subject.trim(),
        text: message.trim(),
        html: toHtml(message.trim())
      });
      delivered += emailBatch.length;
    } catch {
      failedBatches += 1;
    }
  }

  if (delivered === 0) {
    res.status(500).json(new ApiResponse(false, "Failed to send notice emails", {
      audience,
      requestedRecipients: recipientEmails.length,
      delivered,
      failedBatches
    }));
    return;
  }

  res.status(200).json(new ApiResponse(true, "Notice sent successfully", {
    audience,
    requestedRecipients: recipientEmails.length,
    delivered,
    failedBatches
  }));
});
