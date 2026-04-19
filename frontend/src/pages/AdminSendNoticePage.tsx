import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { sendNotice, type NoticeAudience } from "../services/notice.api";

function errMsg(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? "Failed to send notice.";
  }
  return "Failed to send notice.";
}

const AdminSendNoticePage = () => {
  const { user } = useAuth();

  const [audience, setAudience] = useState<NoticeAudience>("both");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    audience: NoticeAudience;
    requestedRecipients: number;
    delivered: number;
    failedBatches: number;
  } | null>(null);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!message.trim()) {
      setError("Notice message is required.");
      return;
    }

    setError("");
    setResult(null);
    setIsSending(true);

    try {
      const response = await sendNotice({
        audience,
        subject: subject.trim(),
        message: message.trim()
      });

      setResult(response.data.data);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-card">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Admin Panel</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-strong)]">Send Notice</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Send announcements to all registered students, guides, or both audiences via email.
        </p>
      </header>

      {error ? <p className="rounded-lg border border-[var(--danger)]/35 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">{error}</p> : null}

      {result ? (
        <div className="rounded-lg border border-[var(--ok)]/35 bg-[var(--ok)]/10 px-4 py-3 text-sm text-[var(--ok)]">
          Notice sent. Delivered: {result.delivered}/{result.requestedRecipients}. Failed batches: {result.failedBatches}.
        </div>
      ) : null}

      <form onSubmit={handleSend} className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-card space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Send To</span>
          <select
            value={audience}
            onChange={(event) => setAudience(event.target.value as NoticeAudience)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-0)] px-3 py-3 text-sm text-[var(--text-body)] outline-none transition focus:border-[var(--primary)]/45 focus:ring-4 focus:ring-[color:var(--primary)]/10"
          >
            <option value="students">Students</option>
            <option value="guides">Guides</option>
            <option value="both">Students and Guides</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Enter notice subject"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-0)] px-3 py-3 text-sm text-[var(--text-body)] outline-none transition focus:border-[var(--primary)]/45 focus:ring-4 focus:ring-[color:var(--primary)]/10"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Message</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={8}
            placeholder="Type your notice here..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-0)] px-3 py-3 text-sm text-[var(--text-body)] outline-none transition focus:border-[var(--primary)]/45 focus:ring-4 focus:ring-[color:var(--primary)]/10"
          />
        </label>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send Notice"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSendNoticePage;
