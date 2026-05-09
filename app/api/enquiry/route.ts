import { NextResponse } from "next/server";

/**
 * Enquiry intake stub.
 *
 * Email transport (Resend / SendGrid / SMTP) will be wired up in a follow-up.
 * For now we validate the payload, log it server-side and acknowledge.
 */

export const runtime = "nodejs";

type EnquiryPayload = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  country?: string;
  topic?: string;
  productName?: string;
  productSlug?: string;
  quantity?: string;
  application?: string;
  message?: string;
};

export async function POST(req: Request) {
  let body: EnquiryPayload;
  try {
    body = (await req.json()) as EnquiryPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const required: (keyof EnquiryPayload)[] = ["name", "email", "company", "message"];
  for (const key of required) {
    if (!body[key] || !String(body[key]).trim()) {
      return NextResponse.json(
        { ok: false, error: `Missing field: ${key}` },
        { status: 400 }
      );
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400 }
    );
  }

  // TODO: wire email delivery here.
  // eslint-disable-next-line no-console
  console.info("[enquiry]", {
    receivedAt: new Date().toISOString(),
    ...body,
  });

  return NextResponse.json({ ok: true });
}
