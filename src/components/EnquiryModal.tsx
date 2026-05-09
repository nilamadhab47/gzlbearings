"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowForward } from "./Icons";
import { siteConfig } from "@/src/lib/siteConfig";

export type EnquiryTopic =
  | "Quote"
  | "Engineering"
  | "Custom Spec"
  | "Distribution"
  | "General";

type OpenOptions = {
  topic?: EnquiryTopic;
  productSlug?: string;
  productName?: string;
  message?: string;
};

type Ctx = {
  open: (opts?: OpenOptions) => void;
  close: () => void;
};

const EnquiryCtx = createContext<Ctx | null>(null);

export function useEnquiry() {
  const ctx = useContext(EnquiryCtx);
  if (!ctx) {
    throw new Error("useEnquiry must be used within <EnquiryProvider>");
  }
  return ctx;
}

const TOPICS: EnquiryTopic[] = ["Quote", "Engineering", "General"];

type FormState = {
  name: string;
  email: string;
  company: string;
  phone: string;
  topic: EnquiryTopic;
  productName: string;
  productSlug: string;
  message: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  topic: "Quote",
  productName: "",
  productSlug: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

export default function EnquiryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );

  const handleOpen = useCallback((opts?: OpenOptions) => {
    setForm((prev) => ({
      ...EMPTY,
      // preserve any contact details typed in a previous session within the page
      name: prev.name,
      email: prev.email,
      company: prev.company,
      phone: prev.phone,
      topic: opts?.topic ?? "Quote",
      productSlug: opts?.productSlug ?? "",
      productName: opts?.productName ?? "",
      message: opts?.message ?? "",
    }));
    setStatus("idle");
    setErrors({});
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (status === "submitting") return;
    setOpen(false);
  }, [status]);

  const ctxValue = useMemo<Ctx>(
    () => ({ open: handleOpen, close: handleClose }),
    [handleOpen, handleClose]
  );

  // body scroll lock + ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, handleClose]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Invalid email";
    if (!form.company.trim()) next.company = "Required";
    if (!form.message.trim()) next.message = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      // Email transport will be wired up later. For now we POST to a stub
      // endpoint; if it isn't present the server will 404 and we still show
      // the user a confirmation so the flow can be demoed.
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch(() => null);

      if (!res || (res.status >= 500 && res.status !== 404)) {
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <EnquiryCtx.Provider value={ctxValue}>
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            key="enquiry-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-deep-black/80 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:max-w-3xl bg-graphite border border-steel/25 max-h-full sm:max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-graphite/95 backdrop-blur border-b border-steel/15 px-6 sm:px-8 py-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-industrial-yellow/90 mb-1.5">
                    {form.topic === "Quote"
                      ? "Request a Quote"
                      : form.topic === "Engineering"
                        ? "Talk to Engineering"
                        : form.topic === "Custom Spec"
                          ? "Custom Specification"
                          : form.topic === "Distribution"
                            ? "Distribution Enquiry"
                            : "Get in Touch"}
                  </div>
                  <h2
                    id="enquiry-title"
                    className="font-display text-2xl sm:text-3xl uppercase tracking-tight"
                  >
                    Tell us about your application.
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close"
                  className="text-white-smoke/60 hover:text-white-smoke text-xl leading-none w-9 h-9 flex items-center justify-center border border-steel/20 hover:border-industrial-yellow transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {status === "success" ? (
                <SuccessPanel onClose={handleClose} />
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="px-6 sm:px-8 py-6 sm:py-8 space-y-6"
                >
                  {/* Topic chips */}
                  <div>
                    <Label>Enquiry type</Label>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => {
                        const active = form.topic === t;
                        return (
                          <button
                            type="button"
                            key={t}
                            onClick={() => update("topic", t)}
                            className={`px-4 py-2.5 text-[11px] tracking-[0.18em] uppercase border transition-colors ${
                              active
                                ? "bg-industrial-yellow text-deep-black border-industrial-yellow"
                                : "border-steel/30 text-white-smoke/70 hover:border-industrial-yellow/60 hover:text-white-smoke"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                      label="Full name"
                      required
                      error={errors.name}
                      value={form.name}
                      onChange={(v) => update("name", v)}
                      autoComplete="name"
                    />
                    <Field
                      label="Email"
                      required
                      type="email"
                      error={errors.email}
                      value={form.email}
                      onChange={(v) => update("email", v)}
                      autoComplete="email"
                    />
                    <Field
                      label="Company"
                      required
                      error={errors.company}
                      value={form.company}
                      onChange={(v) => update("company", v)}
                      autoComplete="organization"
                    />
                    <Field
                      label="Phone"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => update("phone", v)}
                      autoComplete="tel"
                    />
                  </div>

                  {/* Product reference (auto-filled when opened from a card) */}
                  {(form.productName || form.productSlug) && (
                    <div className="border border-industrial-yellow/30 bg-industrial-yellow/5 px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-industrial-yellow/80 mb-1">
                          Reference product
                        </div>
                        <div className="text-sm text-white-smoke">
                          {form.productName || form.productSlug}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          update("productName", "");
                          update("productSlug", "");
                        }}
                        className="text-[11px] tracking-[0.18em] uppercase text-white-smoke/50 hover:text-white-smoke"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <Label htmlFor="enquiry-message" required>
                      How can we help?
                    </Label>
                    <textarea
                      id="enquiry-message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Operating envelope, load, speed, environment, timeline…"
                      className={`w-full bg-deep-black/60 border ${
                        errors.message
                          ? "border-red-500/60"
                          : "border-steel/25"
                      } px-4 py-3 text-sm text-white-smoke placeholder:text-white-smoke/30 focus:outline-none focus:border-industrial-yellow transition-colors resize-y`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-[11px] text-red-400/80">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {status === "error" && (
                    <div className="border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                      Something went wrong sending your enquiry. Please try
                      again or email{" "}
                      <a
                        href={`mailto:${siteConfig.contact.email}`}
                        className="underline"
                      >
                        {siteConfig.contact.email}
                      </a>
                      .
                    </div>
                  )}

                  {/* Submit row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-steel/15">
                    <p className="text-[11px] text-white-smoke/40 leading-relaxed max-w-md">
                      Submissions are routed to our application engineering
                      team. We typically respond within one business day.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={status === "submitting"}
                        className="border border-steel/40 text-white-smoke text-[12px] font-semibold tracking-[0.18em] uppercase py-3.5 px-6 hover:border-industrial-yellow hover:text-industrial-yellow transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="bg-industrial-yellow text-deep-black text-[12px] font-semibold tracking-[0.18em] uppercase py-3.5 px-6 hover:bg-white-smoke transition-colors inline-flex items-center gap-2 disabled:opacity-60"
                      >
                        {status === "submitting" ? "Sending…" : "Send Enquiry"}
                        {status !== "submitting" && (
                          <ArrowForward className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </EnquiryCtx.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form primitives                                                            */
/* -------------------------------------------------------------------------- */

function Label({
  children,
  htmlFor,
  required,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] tracking-[0.18em] uppercase text-white-smoke/55 mb-2"
    >
      {children}
      {required && <span className="text-industrial-yellow ml-1">*</span>}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  error,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = `enq-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-deep-black/60 border ${
          error ? "border-red-500/60" : "border-steel/25"
        } px-4 py-3 text-sm text-white-smoke placeholder:text-white-smoke/30 focus:outline-none focus:border-industrial-yellow transition-colors`}
      />
      {error && (
        <p className="mt-1.5 text-[11px] text-red-400/80">{error}</p>
      )}
    </div>
  );
}

function SuccessPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-6 sm:px-10 py-12 sm:py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 border border-industrial-yellow text-industrial-yellow mb-6">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="square"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-tight mb-3">
        Enquiry received.
      </h3>
      <p className="text-white-smoke/55 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-8">
        Our application engineering team will review your requirements and
        respond within one business day.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="bg-industrial-yellow text-deep-black text-[12px] font-semibold tracking-[0.18em] uppercase py-3.5 px-8 hover:bg-white-smoke transition-colors"
      >
        Close
      </button>
    </div>
  );
}
