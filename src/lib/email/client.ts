import { Resend } from "resend";

let cached: Resend | null = null;

/**
 * Lazily instantiates the Resend client. Returns null when RESEND_API_KEY
 * isn't configured so callers can degrade gracefully (e.g. in local dev or
 * preview environments without secrets).
 */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

export const emailConfig = {
  /** "GLZ Bearings <enquiries@mail.glzbearings.com>" — must be a verified sender. */
  from: process.env.RESEND_FROM_EMAIL || "GLZ Bearings <onboarding@resend.dev>",
  /** Internal recipient(s) for new enquiries. Comma-separated supported. */
  to: (process.env.ENQUIRY_TO_EMAIL || "engineering@glzbearings.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  /** Optional BCC for audit/CRM. */
  bcc: (process.env.ENQUIRY_BCC_EMAIL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  /** Reply-To override for the customer auto-reply. */
  replyTo: process.env.ENQUIRY_REPLY_TO || "engineering@glzbearings.com",
};
