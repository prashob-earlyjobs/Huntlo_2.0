"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { legalPageHref } from "@/lib/legalPages";

const ENQUIRY_TYPES = [
  "General Enquiry",
  "Product Enquiry",
  "Demo Request",
  "Partnership",
  "Support",
] as const;

type EnquiryType = (typeof ENQUIRY_TYPES)[number];
type FormStatus = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<
  Record<"fullName" | "workEmail" | "enquiryType" | "message", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL = "info@huntlo.ai";
const CONTACT_PHONE_DISPLAY = "+91 9611329404";
const CONTACT_PHONE_HREF = "tel:+919611329404";

const fieldClassName =
  "mt-2 w-full rounded-lg border border-[#c3c6d6]/70 bg-white px-3.5 py-2.5 text-sm text-[#141b2b] outline-none transition-[border-color,box-shadow] placeholder:text-[#434654]/55 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20";

const labelClassName = "block text-sm font-medium text-[#141b2b]";

function ContactAside() {
  return (
    <aside className="lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-2xl border border-[#c3c6d6]/45 bg-white shadow-[0_12px_40px_-24px_rgba(20,27,43,0.35)]">
        <div className="border-b border-[#c3c6d6]/35 bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
            Direct contact
          </p>
          <h2 className="mt-1.5 font-[family-name:var(--font-inter)] text-lg font-bold tracking-tight">
            Prefer to reach us?
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-white/80">
            Our team usually replies within one business day.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group flex items-start gap-3 rounded-xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3.5 transition-colors hover:border-[#2563EB]/35 hover:bg-[#eff4ff]"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
              <MaterialIcon name="mail" className="text-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium uppercase tracking-wide text-[#434654]/80">
                Email
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-[#141b2b] group-hover:text-[#2563EB]">
                {CONTACT_EMAIL}
              </span>
            </span>
          </a>

          <a
            href={CONTACT_PHONE_HREF}
            className="group flex items-start gap-3 rounded-xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3.5 transition-colors hover:border-[#2563EB]/35 hover:bg-[#eff4ff]"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
              <MaterialIcon name="call" className="text-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium uppercase tracking-wide text-[#434654]/80">
                Phone
              </span>
              <span className="mt-0.5 block text-sm font-semibold tracking-wide text-[#141b2b] group-hover:text-[#2563EB]">
                {CONTACT_PHONE_DISPLAY}
              </span>
            </span>
          </a>

          <div className="rounded-xl border border-dashed border-[#c3c6d6]/55 bg-[#fafbff] px-4 py-3">
            <p className="text-xs leading-relaxed text-[#434654]">
              For sales, partnerships, billing, and product questions — use the form or contact
              details above.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ContactPageContent() {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [enquiryType, setEnquiryType] = useState<EnquiryType | "">("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const submittingRef = useRef(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!workEmail.trim()) {
      next.workEmail = "Work email is required.";
    } else if (!EMAIL_RE.test(workEmail.trim())) {
      next.workEmail = "Enter a valid email address.";
    }
    if (!enquiryType) next.enquiryType = "Please select an enquiry type.";
    if (!message.trim()) next.message = "Please tell us how we can help.";
    return next;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current || status === "submitting" || status === "success") {
      return;
    }

    // Honeypot — bots that fill this are ignored.
    if (website.trim()) {
      setStatus("success");
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus("idle");
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");

    try {
      const subject = encodeURIComponent(`Huntlo enquiry: ${enquiryType}`);
      const body = encodeURIComponent(
        [
          `Name: ${fullName.trim()}`,
          `Email: ${workEmail.trim()}`,
          companyName.trim() ? `Company: ${companyName.trim()}` : null,
          `Enquiry type: ${enquiryType}`,
          "",
          message.trim(),
        ]
          .filter(Boolean)
          .join("\n")
      );

      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  const formBody =
    status === "success" ? (
      <div
        className="rounded-xl border border-[#c3c6d6]/50 bg-white px-6 py-10 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium leading-relaxed text-[#141b2b] md:text-lg">
          Thank you for reaching out. Your email client should open so you can send the message to{" "}
          {CONTACT_EMAIL}.
        </p>
      </div>
    ) : (
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="contact-full-name" className={labelClassName}>
            Full Name <span className="text-[#2563EB]">*</span>
          </label>
          <input
            id="contact-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={fieldClassName}
            aria-invalid={Boolean(fieldErrors.fullName)}
            disabled={status === "submitting"}
          />
          {fieldErrors.fullName ? (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.fullName}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-work-email" className={labelClassName}>
            Work Email <span className="text-[#2563EB]">*</span>
          </label>
          <input
            id="contact-work-email"
            name="workEmail"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={200}
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            className={fieldClassName}
            aria-invalid={Boolean(fieldErrors.workEmail)}
            disabled={status === "submitting"}
          />
          {fieldErrors.workEmail ? (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.workEmail}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-company-name" className={labelClassName}>
            Company Name <span className="font-normal text-[#434654]/70">(optional)</span>
          </label>
          <input
            id="contact-company-name"
            name="companyName"
            type="text"
            autoComplete="organization"
            maxLength={160}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={fieldClassName}
            disabled={status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor="contact-enquiry-type" className={labelClassName}>
            Enquiry Type <span className="text-[#2563EB]">*</span>
          </label>
          <select
            id="contact-enquiry-type"
            name="enquiryType"
            required
            value={enquiryType}
            onChange={(e) => setEnquiryType(e.target.value as EnquiryType | "")}
            className={fieldClassName}
            aria-invalid={Boolean(fieldErrors.enquiryType)}
            disabled={status === "submitting"}
          >
            <option value="" disabled>
              Select an option
            </option>
            {ENQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {fieldErrors.enquiryType ? (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.enquiryType}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-message" className={labelClassName}>
            How Can We Help? <span className="text-[#2563EB]">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            maxLength={4000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${fieldClassName} min-h-[120px] resize-y`}
            aria-invalid={Boolean(fieldErrors.message)}
            disabled={status === "submitting"}
          />
          {fieldErrors.message ? (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.message}</p>
          ) : null}
        </div>

        {/* Honeypot — hidden from assistive tech and sighted users */}
        <div
          className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <p className="text-xs leading-relaxed text-[#434654]">
          By submitting this form, you agree that Huntlo may use your details to respond to your
          enquiry, in accordance with our{" "}
          <Link
            href={legalPageHref("privacy")}
            className="font-medium text-[#2563EB] hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {status === "error" ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            role="alert"
          >
            We couldn&apos;t open your email client. Please email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">
              {CONTACT_EMAIL}
            </a>{" "}
            directly.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {status === "submitting" ? "Opening email…" : "Send Enquiry"}
        </button>
      </form>
    );

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>{formBody}</div>
      <ContactAside />
    </div>
  );
}
