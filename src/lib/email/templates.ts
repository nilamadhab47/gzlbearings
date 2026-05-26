import { siteConfig } from "@/src/lib/siteConfig";

/**
 * GLZ Bearings transactional email templates.
 *
 * Inline-styled, table-based HTML for maximum email client compatibility
 * (Gmail, Outlook, Apple Mail, mobile clients). Always paired with a
 * plain-text alternative for deliverability + accessibility.
 */

export type EnquiryData = {
  name: string;
  email: string;
  company: string;
  phone?: string;
  topic: string;
  productName?: string;
  productSlug?: string;
  message: string;
  submittedAt: string; // ISO
  userAgent?: string;
  ip?: string;
};

const BRAND = {
  black: "#0B0B0B",
  graphite: "#1A1A1A",
  steel: "#5C5C5C",
  yellow: "#F4C400",
  smoke: "#F5F5F5",
  border: "#2A2A2A",
  subtle: "#9A9A9A",
};

const SITE_URL = siteConfig.url;
const LOGO_TEXT = "GLZ";
const COMPANY = siteConfig.legalName;
const SUPPORT_EMAIL = siteConfig.contact.email;
const SUPPORT_PHONE = siteConfig.contact.phoneDisplay;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/* -------------------------------------------------------------------------- */
/*  Shared chrome                                                              */
/* -------------------------------------------------------------------------- */

function shell(opts: {
  preheader: string;
  accentLabel: string;
  title: string;
  body: string;
  footerNote?: string;
}): string {
  const { preheader, accentLabel, title, body, footerNote } = opts;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>${escapeHtml(title)}</title>
    <!--[if mso]>
    <style type="text/css">
      table, td, div, h1, p { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
  </head>
  <body style="margin:0;padding:0;background:${BRAND.black};color:${BRAND.smoke};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.black};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${BRAND.graphite};border:1px solid ${BRAND.border};">

            <!-- Header -->
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid ${BRAND.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="display:inline-block;padding:8px 12px;background:${BRAND.yellow};color:${BRAND.black};font-weight:800;letter-spacing:0.18em;font-size:14px;line-height:1;font-family:Arial,Helvetica,sans-serif;">
                        ${LOGO_TEXT}
                      </div>
                    </td>
                    <td align="right" style="vertical-align:middle;color:${BRAND.subtle};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">
                      ${escapeHtml(accentLabel)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Accent bar -->
            <tr>
              <td style="height:3px;background:${BRAND.yellow};line-height:3px;font-size:0;">&nbsp;</td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 32px 32px;">
                ${body}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 32px 28px;border-top:1px solid ${BRAND.border};background:${BRAND.black};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="color:${BRAND.subtle};font-size:11px;line-height:1.6;letter-spacing:0.04em;">
                      <div style="color:${BRAND.smoke};font-weight:600;letter-spacing:0.18em;text-transform:uppercase;font-size:11px;margin-bottom:6px;">
                        ${escapeHtml(siteConfig.name)}
                      </div>
                      <div>${escapeHtml(COMPANY)}</div>
                      <div>${escapeHtml(siteConfig.contact.address.street)}, ${escapeHtml(siteConfig.contact.address.locality)} ${escapeHtml(siteConfig.contact.address.postalCode)}, India</div>
                      <div style="margin-top:8px;">
                        <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.yellow};text-decoration:none;">${SUPPORT_EMAIL}</a>
                        &nbsp;·&nbsp;
                        <a href="tel:${siteConfig.contact.phone}" style="color:${BRAND.smoke};text-decoration:none;">${SUPPORT_PHONE}</a>
                        &nbsp;·&nbsp;
                        <a href="${SITE_URL}" style="color:${BRAND.smoke};text-decoration:none;">glzbearings.com</a>
                      </div>
                      ${
                        footerNote
                          ? `<div style="margin-top:14px;color:${BRAND.steel};font-size:10px;letter-spacing:0.08em;">${escapeHtml(footerNote)}</div>`
                          : ""
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style="color:${BRAND.steel};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin-top:18px;font-family:Arial,Helvetica,sans-serif;">
            ${escapeHtml(siteConfig.tagline)}
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function detailRow(label: string, value: string, isLink?: "email" | "tel"): string {
  const safe = escapeHtml(value);
  const rendered =
    isLink === "email"
      ? `<a href="mailto:${safe}" style="color:${BRAND.yellow};text-decoration:none;">${safe}</a>`
      : isLink === "tel"
        ? `<a href="tel:${safe.replace(/\s/g, "")}" style="color:${BRAND.smoke};text-decoration:none;">${safe}</a>`
        : safe;

  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;width:140px;color:${BRAND.subtle};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;color:${BRAND.smoke};font-size:14px;line-height:1.5;">
        ${rendered}
      </td>
    </tr>`;
}

/* -------------------------------------------------------------------------- */
/*  Internal team notification                                                 */
/* -------------------------------------------------------------------------- */

export function renderTeamEnquiryEmail(data: EnquiryData) {
  const subject = `[${data.topic}] ${data.company} — ${data.name}${
    data.productName ? ` · ${data.productName}` : ""
  }`;

  const body = `
    <div style="color:${BRAND.subtle};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:10px;">
      New enquiry · ${escapeHtml(data.topic)}
    </div>
    <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;color:${BRAND.smoke};font-weight:700;letter-spacing:-0.01em;">
      ${escapeHtml(data.name)}
    </h1>
    <div style="color:${BRAND.subtle};font-size:14px;margin-bottom:28px;">
      ${escapeHtml(data.company)} · received ${escapeHtml(formatDate(data.submittedAt))} IST
    </div>

    ${
      data.productName || data.productSlug
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.black};border:1px solid ${BRAND.yellow};margin-bottom:28px;">
            <tr>
              <td style="padding:14px 16px;">
                <div style="color:${BRAND.yellow};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:4px;">Reference product</div>
                <div style="color:${BRAND.smoke};font-size:14px;font-weight:600;">${escapeHtml(data.productName || data.productSlug || "")}</div>
                ${data.productSlug ? `<div style="color:${BRAND.subtle};font-size:12px;margin-top:2px;font-family:'SF Mono',Menlo,Consolas,monospace;">${escapeHtml(data.productSlug)}</div>` : ""}
              </td>
            </tr>
          </table>`
        : ""
    }

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      ${detailRow("Name", data.name)}
      ${detailRow("Email", data.email, "email")}
      ${detailRow("Company", data.company)}
      ${data.phone ? detailRow("Phone", data.phone, "tel") : ""}
      ${detailRow("Topic", data.topic)}
    </table>

    <div style="color:${BRAND.subtle};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:10px;">
      Message
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.black};border-left:3px solid ${BRAND.yellow};margin-bottom:32px;">
      <tr>
        <td style="padding:18px 20px;color:${BRAND.smoke};font-size:14px;line-height:1.7;">
          ${nl2br(data.message)}
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:${BRAND.yellow};">
          <a href="mailto:${escapeHtml(data.email)}?subject=${encodeURIComponent("Re: Your enquiry with GLZ Bearings")}"
             style="display:inline-block;padding:14px 24px;color:${BRAND.black};text-decoration:none;font-weight:700;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;">
            Reply to ${escapeHtml(data.name.split(" ")[0] || "sender")}
          </a>
        </td>
      </tr>
    </table>

    ${
      data.userAgent || data.ip
        ? `<div style="margin-top:32px;padding-top:20px;border-top:1px solid ${BRAND.border};color:${BRAND.steel};font-size:11px;line-height:1.7;font-family:'SF Mono',Menlo,Consolas,monospace;">
            ${data.ip ? `IP: ${escapeHtml(data.ip)}<br />` : ""}
            ${data.userAgent ? `UA: ${escapeHtml(data.userAgent)}` : ""}
          </div>`
        : ""
    }
  `;

  const html = shell({
    preheader: `${data.topic} enquiry from ${data.name} at ${data.company}`,
    accentLabel: "Internal · Enquiry intake",
    title: subject,
    body,
    footerNote: "This is an automated notification from the website enquiry form.",
  });

  const text = [
    `GLZ BEARINGS — NEW ENQUIRY`,
    ``,
    `Topic:    ${data.topic}`,
    `Received: ${formatDate(data.submittedAt)} IST`,
    ``,
    `Name:    ${data.name}`,
    `Email:   ${data.email}`,
    `Company: ${data.company}`,
    data.phone ? `Phone:   ${data.phone}` : null,
    data.productName ? `Product: ${data.productName}${data.productSlug ? ` (${data.productSlug})` : ""}` : null,
    ``,
    `Message:`,
    data.message,
    ``,
    `— Reply directly to this email to respond to ${data.name}.`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

/* -------------------------------------------------------------------------- */
/*  Customer auto-reply                                                        */
/* -------------------------------------------------------------------------- */

export function renderCustomerAutoReply(data: EnquiryData) {
  const firstName = (data.name.split(" ")[0] || data.name).trim();
  const subject = `We've received your enquiry — GLZ Bearings`;

  const body = `
    <div style="color:${BRAND.subtle};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:10px;">
      Confirmation
    </div>
    <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;color:${BRAND.smoke};font-weight:700;letter-spacing:-0.01em;">
      Thank you, ${escapeHtml(firstName)}.
    </h1>
    <p style="margin:0 0 14px;color:${BRAND.smoke};font-size:15px;line-height:1.7;">
      Your enquiry has reached our application engineering team in New Delhi.
      We typically respond within <strong style="color:${BRAND.yellow};">one business day</strong>
      with technical specifications, lead times, and pricing tailored to your requirement.
    </p>
    <p style="margin:0 0 24px;color:${BRAND.smoke};font-size:14px;line-height:1.7;">
      We've attached our latest <strong style="color:${BRAND.yellow};">product catalogue</strong>
      to this email — feel free to browse it while you wait.
    </p>
    <p style="margin:0 0 28px;color:${BRAND.subtle};font-size:14px;line-height:1.7;">
      For urgent matters, reply to this email or reach us directly on
      <a href="tel:${siteConfig.contact.phone}" style="color:${BRAND.yellow};text-decoration:none;">${SUPPORT_PHONE}</a>.
    </p>

    <div style="color:${BRAND.subtle};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:12px;">
      Summary of your enquiry
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.black};border:1px solid ${BRAND.border};margin-bottom:28px;">
      <tr>
        <td style="padding:18px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${detailRow("Topic", data.topic)}
            ${data.productName ? detailRow("Product", data.productName) : ""}
            ${detailRow("Company", data.company)}
            <tr>
              <td style="padding:12px 0 0;vertical-align:top;width:140px;color:${BRAND.subtle};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
                Message
              </td>
              <td style="padding:12px 0 0;vertical-align:top;color:${BRAND.smoke};font-size:14px;line-height:1.6;">
                ${nl2br(data.message)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <tr>
        <td>
          <div style="color:${BRAND.subtle};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:14px;">
            While you wait
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:top;padding:12px 14px;background:${BRAND.black};border:1px solid ${BRAND.border};width:50%;">
                <div style="color:${BRAND.yellow};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:6px;">Catalogue</div>
                <div style="color:${BRAND.smoke};font-size:13px;line-height:1.5;margin-bottom:10px;">
                  Browse our precision bearing range — spherical, cylindrical, tapered, angular contact.
                </div>
                <a href="${SITE_URL}/products" style="color:${BRAND.yellow};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">
                  View products →
                </a>
              </td>
              <td style="width:8px;font-size:0;line-height:0;">&nbsp;</td>
              <td style="vertical-align:top;padding:12px 14px;background:${BRAND.black};border:1px solid ${BRAND.border};width:50%;">
                <div style="color:${BRAND.yellow};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:6px;">Engineering</div>
                <div style="color:${BRAND.smoke};font-size:13px;line-height:1.5;margin-bottom:10px;">
                  Need a custom spec or assembly? Our team works to your drawings.
                </div>
                <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.yellow};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">
                  Talk to us →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = shell({
    preheader: `We've received your ${data.topic.toLowerCase()} enquiry and will respond within one business day.`,
    accentLabel: "Enquiry confirmation",
    title: subject,
    body,
    footerNote: `You're receiving this because you submitted an enquiry on ${SITE_URL}.`,
  });

  const text = [
    `Thank you, ${firstName}.`,
    ``,
    `Your enquiry has reached our application engineering team in New Delhi.`,
    `We typically respond within one business day.`,
    ``,
    `— Summary —`,
    `Topic:   ${data.topic}`,
    data.productName ? `Product: ${data.productName}` : null,
    `Company: ${data.company}`,
    ``,
    `Message:`,
    data.message,
    ``,
    `For urgent matters, reply to this email or call ${SUPPORT_PHONE}.`,
    ``,
    `— ${siteConfig.name}`,
    `${COMPANY}`,
    `${SITE_URL}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
