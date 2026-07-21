"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  companyNameFromWorkEmail,
  isWorkEmail,
  workEmailDomain,
  WORK_EMAIL_ERROR,
} from "@/lib/work-email";
import { useAuth } from "@/providers/auth-provider";
import { CompanyDomainLogo } from "@/components/shared/company-domain-logo";

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

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<SignupFormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const autoCompanyNameRef = useRef("");

  const selectedCountry = useMemo(() => getPhoneCountry(form.countryIso), [form.countryIso]);
  const companyDomain = useMemo(() => workEmailDomain(form.email), [form.email]);

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validateSignup(form);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldError(null);
    try {
      const mobile = composeE164Mobile(selectedCountry.dialCode, form.mobile);
      const nextUser = await register({
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim().toLowerCase(),
        mobile,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      router.replace(resolvePostAuthDestination(nextUser, peekPendingRedirectPath()));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create your account."));
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
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
