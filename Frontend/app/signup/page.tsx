"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { CompanyDomainLogo } from "@/components/shared/company-domain-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api";
import { resolvePostAuthDestination } from "@/lib/auth-redirect";
import { peekPendingRedirectPath } from "@/lib/claim-public-search";
import {
  composeE164Mobile,
  DEFAULT_PHONE_COUNTRY_ISO,
  getPhoneCountry,
  nationalNumberPlaceholder,
  PHONE_COUNTRIES,
} from "@/lib/phone-countries";
import { cn } from "@/lib/utils";
import {
  buildAttributionPayload,
  persistUtm,
  readUtmFromSearch,
} from "@/lib/utm";
import {
  companyNameFromWorkEmail,
  isWorkEmail,
  workEmailDomain,
  WORK_EMAIL_ERROR,
} from "@/lib/work-email";
import { useAuth } from "@/providers/auth-provider";

const OTP_LENGTH = 5;

type SignupFormState = {
  fullName: string;
  companyName: string;
  email: string;
  countryIso: string;
  mobile: string;
  password: string;
  confirmPassword: string;
};

const INITIAL: SignupFormState = {
  fullName: "",
  companyName: "",
  email: "",
  countryIso: DEFAULT_PHONE_COUNTRY_ISO,
  mobile: "",
  password: "",
  confirmPassword: "",
};

function validateSignup(form: SignupFormState): string | null {
  if (!form.fullName.trim()) return "Full name is required.";
  if (form.fullName.trim().length > 160) return "Full name is too long.";
  if (!form.email.trim()) return "Work email is required.";
  if (!isWorkEmail(form.email)) return WORK_EMAIL_ERROR;
  if (!form.companyName.trim()) return "Company name is required.";
  if (form.companyName.trim().length > 120) return "Company name is too long.";
  if (!form.mobile.trim()) return "Mobile number is required.";
  const composed = composeE164Mobile(getPhoneCountry(form.countryIso).dialCode, form.mobile);
  if (composed.replace(/\D/g, "").length < 8) return "Enter a valid mobile number.";
  if (form.password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
    return "Password must include upper, lower, and a number.";
  }
  if (form.password !== form.confirmPassword) return "Passwords do not match.";
  return null;
}

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<SignupFormState>(INITIAL);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const autoCompanyNameRef = useRef("");
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otpBusyRef = useRef(false);
  const otpSubmitLockRef = useRef(false);

  const selectedCountry = useMemo(() => getPhoneCountry(form.countryIso), [form.countryIso]);
  const companyDomain = useMemo(() => workEmailDomain(form.email), [form.email]);
  const otpValue = otpDigits.join("");
  const otpComplete = otpValue.length === OTP_LENGTH && /^\d{5}$/.test(otpValue);
  const resendRemainingSeconds =
    resendAvailableAt == null
      ? 0
      : Math.max(0, Math.ceil((resendAvailableAt - nowMs) / 1000));
  const canResend = resendRemainingSeconds <= 0 && !resendBusy && !otpBusy;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromUrl = readUtmFromSearch(window.location.search);
    if (fromUrl) persistUtm(fromUrl);
  }, []);

  useEffect(() => {
    if (!otpOpen) return;
    const timer = window.setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [otpOpen]);

  useEffect(() => {
    if (!otpOpen || resendAvailableAt == null) return;
    if (resendAvailableAt <= Date.now()) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [otpOpen, resendAvailableAt]);

  function updateField<K extends keyof SignupFormState>(key: K, value: SignupFormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (key === "companyName") {
      autoCompanyNameRef.current = "";
    }
  }

  function applyCompanyFromEmail(email: string) {
    const suggested = companyNameFromWorkEmail(email);
    if (!suggested) return;
    setForm((previous) => {
      const current = previous.companyName.trim();
      const previousAuto = autoCompanyNameRef.current.trim();
      const canReplace =
        !current ||
        (previousAuto.length > 0 &&
          current.toLowerCase() === previousAuto.toLowerCase());
      if (!canReplace) return previous;
      autoCompanyNameRef.current = suggested;
      return { ...previous, companyName: suggested };
    });
  }

  function resetOtpInputs() {
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setOtpError(null);
    otpSubmitLockRef.current = false;
  }

  function applyOtpSendResult(result: {
    resendAvailableAt: string;
    otp?: string;
  }) {
    setResendAvailableAt(new Date(result.resendAvailableAt).getTime());
    setNowMs(Date.now());
    setDevOtpHint(result.otp ?? null);
  }

  function handleOtpChange(index: number, raw: string) {
    const digitsOnly = raw.replace(/\D/g, "");
    if (!digitsOnly) {
      setOtpDigits((previous) => {
        const next = [...previous];
        next[index] = "";
        return next;
      });
      setOtpError(null);
      return;
    }

    let nextDigits: string[];

    if (digitsOnly.length > 1) {
      const chars = digitsOnly.slice(0, OTP_LENGTH).split("");
      nextDigits = Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] ?? "");
      setOtpDigits(nextDigits);
      setOtpError(null);
      const focusIndex = Math.min(chars.length, OTP_LENGTH) - 1;
      otpInputRefs.current[focusIndex]?.focus();
    } else {
      nextDigits = [...otpDigits];
      nextDigits[index] = digitsOnly;
      setOtpDigits(nextDigits);
      setOtpError(null);
      if (index < OTP_LENGTH - 1) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }

    const code = nextDigits.join("");
    if (/^\d{5}$/.test(code)) {
      void submitOtp(code);
    }
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
      setOtpDigits((previous) => {
        const next = [...previous];
        next[index - 1] = "";
        return next;
      });
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  async function handleResendOtp() {
    if (!canResend) return;
    setResendBusy(true);
    setOtpError(null);
    try {
      const result = await authApi.sendSignupOtp(form.email.trim().toLowerCase());
      applyOtpSendResult(result);
      resetOtpInputs();
      otpSubmitLockRef.current = false;
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setOtpError(getApiErrorMessage(err, "Unable to resend verification code."));
    } finally {
      setResendBusy(false);
    }
  }

  async function submitOtp(code: string) {
    if (!/^\d{5}$/.test(code)) {
      setOtpError("Enter the 5-digit code.");
      return;
    }
    if (otpBusyRef.current || otpSubmitLockRef.current) return;

    otpSubmitLockRef.current = true;
    otpBusyRef.current = true;
    setOtpBusy(true);
    setOtpError(null);
    try {
      const mobile = composeE164Mobile(selectedCountry.dialCode, form.mobile);
      const nextUser = await register({
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim().toLowerCase(),
        mobile,
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp: code,
        attribution: buildAttributionPayload(),
      });
      setOtpOpen(false);
      router.replace(resolvePostAuthDestination(nextUser, peekPendingRedirectPath()));
    } catch (err) {
      otpSubmitLockRef.current = false;
      setOtpError(getApiErrorMessage(err, "Unable to verify the code."));
    } finally {
      otpBusyRef.current = false;
      setOtpBusy(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    await submitOtp(otpValue);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validateSignup(form);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setFieldError(null);
    setSubmitting(true);
    try {
      const result = await authApi.sendSignupOtp(form.email.trim().toLowerCase());
      applyOtpSendResult(result);
      resetOtpInputs();
      setOtpOpen(true);
    } catch (err) {
      setFieldError(getApiErrorMessage(err, "Unable to send verification code."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 space-y-2">
        <BrandLogo />
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start with email and password, then personalize your Huntlo workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => {
              const value = event.target.value;
              updateField("email", value);
              applyCompanyFromEmail(value);
            }}
            onBlur={() => applyCompanyFromEmail(form.email)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <div className="flex items-center gap-2">
            <CompanyDomainLogo
              websiteOrDomain={companyDomain}
              name={form.companyName}
              size={32}
            />
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(event) => updateField("companyName", event.target.value)}
              autoComplete="organization"
              className="flex-1"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile number</Label>
          <div className="flex gap-2">
            <Select
              value={form.countryIso}
              onValueChange={(value) => value && updateField("countryIso", value)}
            >
              <SelectTrigger
                id="mobile-country"
                aria-label="Country code"
                className="h-8 w-[7.5rem] shrink-0"
              >
                <SelectValue>
                  {selectedCountry.iso} +{selectedCountry.dialCode}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" className="max-h-72 min-w-[16rem]">
                {PHONE_COUNTRIES.map((country) => (
                  <SelectItem key={country.iso} value={country.iso}>
                    {country.name} (+{country.dialCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="mobile"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              value={form.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
              placeholder={nationalNumberPlaceholder(form.countryIso)}
              className="flex-1"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Country code +{selectedCountry.dialCode}. You can also paste a full +number.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            minLength={8}
            required
          />
        </div>
        {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Sending code…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>

      <Dialog
        open={otpOpen}
        onOpenChange={(open) => {
          if (otpBusy) return;
          setOtpOpen(open);
          if (!open) {
            resetOtpInputs();
            setDevOtpHint(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm" showCloseButton={!otpBusy}>
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              Enter the 5-digit code we sent to{" "}
              <span className="font-medium text-foreground">
                {form.email.trim() || "your email"}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex justify-center gap-2" role="group" aria-label="One-time passcode">
              {otpDigits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(node) => {
                    otpInputRefs.current[index] = node;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  value={digit}
                  disabled={otpBusy}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onFocus={(event) => event.target.select()}
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                  className={cn(
                    "h-12 w-11 px-0 text-center text-lg font-semibold tracking-widest",
                    otpError && "border-destructive",
                  )}
                />
              ))}
            </div>

            {devOtpHint ? (
              <p className="text-center text-xs text-muted-foreground">
                Dev code: <span className="font-mono font-medium text-foreground">{devOtpHint}</span>
              </p>
            ) : null}

            {otpError ? <p className="text-center text-sm text-destructive">{otpError}</p> : null}

            <p className="text-center text-sm text-muted-foreground">
              {canResend ? (
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
                  disabled={!canResend}
                  onClick={() => void handleResendOtp()}
                >
                  {resendBusy ? "Sending…" : "Resend new code"}
                </button>
              ) : (
                <>
                  Resend new code in{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {formatCountdown(resendRemainingSeconds)}
                  </span>
                </>
              )}
            </p>

            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto" disabled={!otpComplete || otpBusy}>
                {otpBusy ? "Verifying…" : "Verify"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
