import { NextResponse } from "next/server";
import { emailConfig, getResend } from "@/src/lib/email/client";
import {
  renderCustomerAutoReply,
  renderTeamEnquiryEmail,
  type EnquiryData,
} from "@/src/lib/email/templates";
import { getCatalogueAttachment } from "@/src/lib/catalogue/pdf";

/**
 * Enquiry intake endpoint.
 *
 * Validates the payload, sends a styled notification to the GLZ engineering
 * inbox via Resend, and fires a customer-facing auto-reply. If Resend isn't
 * configured the route still returns 200 so previews and local development
 * don't break — the payload is logged for inspection.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EnquiryPayload = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  topic?: string;
  productName?: string;
  productSlug?: string;
  message?: string;
  /** Honeypot — bots fill this, humans never see it. */
  website?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = {
  name: 120,
  email: 200,
  company: 160,
  phone: 40,
  topic: 40,
  productName: 200,
  productSlug: 200,
  message: 5000,
};

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(req: Request) {
  let raw: EnquiryPayload;
  try {
    raw = (await req.json()) as EnquiryPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (raw.website && String(raw.website).trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const body = {
    name: clean(raw.name, MAX_LEN.name),
    email: clean(raw.email, MAX_LEN.email).toLowerCase(),
    company: clean(raw.company, MAX_LEN.company),
    phone: clean(raw.phone, MAX_LEN.phone),
    topic: clean(raw.topic, MAX_LEN.topic) || "General",
    productName: clean(raw.productName, MAX_LEN.productName),
    productSlug: clean(raw.productSlug, MAX_LEN.productSlug),
    message: clean(raw.message, MAX_LEN.message),
  };

  if (!body.name) {
    return NextResponse.json(
      { ok: false, error: "Name is required" },
      { status: 400 }
    );
  }
  if (!body.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email is required" },
      { status: 400 }
    );
  }
  if (!body.company) {
    return NextResponse.json(
      { ok: false, error: "Company is required" },
      { status: 400 }
    );
  }
  if (!body.message || body.message.length < 5) {
    return NextResponse.json(
      { ok: false, error: "Please describe your requirement" },
      { status: 400 }
    );
  }

  const submittedAt = new Date().toISOString();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  const data: EnquiryData = {
    ...body,
    submittedAt,
    ip,
    userAgent,
  };

  const resend = getResend();

  if (!resend) {
    // eslint-disable-next-line no-console
    console.warn(
      "[enquiry] RESEND_API_KEY not configured — enquiry accepted but no email sent.",
      { ...data }
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  const team = renderTeamEnquiryEmail(data);
  const reply = renderCustomerAutoReply(data);

  let catalogueAttachment: { filename: string; content: string }[] | undefined;
  try {
    const att = await getCatalogueAttachment();
    // Resend expects base64-encoded content for attachments.
    catalogueAttachment = [
      { filename: att.filename, content: att.content.toString("base64") },
    ];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[enquiry] catalogue attachment unavailable, sending without it", err);
  }

  try {
    const [internal, customer] = await Promise.all([
      resend.emails.send({
        from: emailConfig.from,
        to: emailConfig.to,
        bcc: emailConfig.bcc.length ? emailConfig.bcc : undefined,
        replyTo: data.email,
        subject: team.subject,
        html: team.html,
        text: team.text,
        attachments: catalogueAttachment,
        headers: {
          "X-Entity-Ref-ID": `enq-${Date.now()}`,
        },
        tags: [
          { name: "type", value: "enquiry-internal" },
          {
            name: "topic",
            value: data.topic.toLowerCase().replace(/\s+/g, "-"),
          },
        ],
      }),
      resend.emails.send({
        from: emailConfig.from,
        to: [data.email],
        replyTo: emailConfig.replyTo,
        subject: reply.subject,
        html: reply.html,
        text: reply.text,
        attachments: catalogueAttachment,
        tags: [{ name: "type", value: "enquiry-autoreply" }],
      }),
    ]);

    if (internal.error || customer.error) {
      // eslint-disable-next-line no-console
      console.error("[enquiry] Resend reported an error", {
        internal: internal.error,
        customer: customer.error,
      });
      if (internal.error) {
        return NextResponse.json(
          { ok: false, error: "Email delivery failed" },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[enquiry] Unexpected error sending email", err);
    return NextResponse.json(
      { ok: false, error: "Email delivery failed" },
      { status: 502 }
    );
  }
}
