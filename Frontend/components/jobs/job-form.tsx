"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import {
  EMPLOYMENT_TYPES,
  EVALUATION_FIELD_OPTIONS,
  JOB_DEPARTMENTS,
  JOB_HIRING_MANAGERS,
  JOB_LOCATIONS,
  JOB_PRIORITIES,
  JOB_RECRUITERS,
  SALARY_CURRENCIES,
  SALARY_VISIBILITY,
  SENIORITY_LEVELS,
  SKILL_SUGGESTIONS,
  WORKPLACE_TYPES,
} from "@/lib/mock-jobs";
import {
  getApiErrorMessage,
  jobsApi,
  type ParsedJobDescription,
} from "@/lib/api";
import { ROUTES, jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<"title" | "department" | "location" | "openings", string>>;

interface JobFormState {
  title: string;
  department: string;
  employmentType: string;
  workplaceType: string;
  openings: string;
  location: string;
  experienceMin: string;
  experienceMax: string;
  requiredSkills: string[];
  preferredSkills: string[];
  seniority: string;
  industryPreference: string;
  education: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  minSalary: string;
  maxSalary: string;
  currency: string;
  salaryVisibility: string;
  recruiter: string;
  hiringManager: string;
  interviewPanel: string;
  screeningObjective: string;
  knockoutQuestions: string;
  aiScreeningEnabled: boolean;
  assessmentEnabled: boolean;
  evaluationFields: string[];
  priority: string;
  targetClosingDate: string;
  tags: string;
  internalNotes: string;
}

const INITIAL_STATE: JobFormState = {
  title: "",
  department: "",
  employmentType: "Full-time",
  workplaceType: "Hybrid",
  openings: "1",
  location: "",
  experienceMin: "3",
  experienceMax: "7",
  requiredSkills: [],
  preferredSkills: [],
  seniority: "Senior",
  industryPreference: "",
  education: "",
  description: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  minSalary: "",
  maxSalary: "",
  currency: "INR",
  salaryVisibility: "Range shown",
  recruiter: "Ananya Sharma",
  hiringManager: "",
  interviewPanel: "",
  screeningObjective: "",
  knockoutQuestions: "",
  aiScreeningEnabled: true,
  assessmentEnabled: false,
  evaluationFields: ["Role fit", "Communication clarity", "Notice period"],
  priority: "Medium",
  targetClosingDate: "",
  tags: "",
  internalNotes: "",
};

function pickOption<T extends string>(
  value: string | null | undefined,
  options: readonly T[],
  fallback: T | "" = ""
): T | "" {
  if (!value) return fallback;
  const exact = options.find(
    (option) => option.toLowerCase() === value.toLowerCase()
  );
  if (exact) return exact;
  const partial = options.find(
    (option) =>
      value.toLowerCase().includes(option.toLowerCase()) ||
      option.toLowerCase().includes(value.toLowerCase())
  );
  return partial ?? fallback;
}

function applyParsedJd(
  previous: JobFormState,
  parsed: ParsedJobDescription
): JobFormState {
  return {
    ...previous,
    title: parsed.title?.trim() || previous.title,
    department:
      pickOption(parsed.department, JOB_DEPARTMENTS, previous.department as "" | (typeof JOB_DEPARTMENTS)[number]) ||
      previous.department,
    employmentType:
      pickOption(
        parsed.employmentType,
        EMPLOYMENT_TYPES,
        previous.employmentType as (typeof EMPLOYMENT_TYPES)[number]
      ) || previous.employmentType,
    workplaceType:
      pickOption(
        parsed.workplaceType,
        WORKPLACE_TYPES,
        previous.workplaceType as (typeof WORKPLACE_TYPES)[number]
      ) || previous.workplaceType,
    openings:
      parsed.openings != null && parsed.openings > 0
        ? String(parsed.openings)
        : previous.openings,
    location:
      pickOption(
        parsed.location,
        JOB_LOCATIONS,
        previous.location as "" | (typeof JOB_LOCATIONS)[number]
      ) || previous.location,
    experienceMin:
      parsed.experienceMin != null
        ? String(parsed.experienceMin)
        : previous.experienceMin,
    experienceMax:
      parsed.experienceMax != null
        ? String(parsed.experienceMax)
        : previous.experienceMax,
    requiredSkills:
      parsed.requiredSkills.length > 0
        ? parsed.requiredSkills
        : previous.requiredSkills,
    preferredSkills:
      parsed.preferredSkills.length > 0
        ? parsed.preferredSkills
        : previous.preferredSkills,
    seniority:
      pickOption(
        parsed.seniority,
        SENIORITY_LEVELS,
        previous.seniority as (typeof SENIORITY_LEVELS)[number]
      ) || previous.seniority,
    industryPreference:
      parsed.industryPreference?.trim() || previous.industryPreference,
    education: parsed.education?.trim() || previous.education,
    description: parsed.description?.trim() || previous.description,
    responsibilities:
      parsed.responsibilities?.trim() || previous.responsibilities,
    requirements: parsed.requirements?.trim() || previous.requirements,
    benefits: parsed.benefits?.trim() || previous.benefits,
    minSalary:
      parsed.minSalary != null ? String(parsed.minSalary) : previous.minSalary,
    maxSalary:
      parsed.maxSalary != null ? String(parsed.maxSalary) : previous.maxSalary,
    currency:
      pickOption(
        parsed.currency,
        SALARY_CURRENCIES,
        previous.currency as (typeof SALARY_CURRENCIES)[number]
      ) || previous.currency,
    priority:
      pickOption(
        parsed.priority,
        JOB_PRIORITIES,
        previous.priority as (typeof JOB_PRIORITIES)[number]
      ) || previous.priority,
    tags: parsed.tags.length > 0 ? parsed.tags.join(", ") : previous.tags,
  };
}

function Field({
  id,
  label,
  required,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SkillChips({
  label,
  skills,
  onAdd,
  onRemove,
  suggestions,
}: {
  label: string;
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
  suggestions: readonly string[];
}) {
  const [draft, setDraft] = useState("");

  function commit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => onRemove(skill)}
            className="inline-flex items-center gap-1 rounded-md bg-brand-subtle px-2 py-1 text-xs font-medium text-primary outline-none hover:bg-brand-subtle/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {skill}
            <X aria-hidden className="size-3" />
            <span className="sr-only">Remove {skill}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(draft);
            }
          }}
          placeholder="Type a skill and press Enter"
          aria-label={`Add ${label.toLowerCase()}`}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => commit(draft)}>
          <Plus aria-hidden />
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions
          .filter((skill) => !skills.includes(skill))
          .slice(0, 6)
          .map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onAdd(skill)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              + {skill}
            </button>
          ))}
      </div>
    </div>
  );
}

export function JobForm() {
  const router = useRouter();
  const [form, setForm] = useState<JobFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touchedPublish, setTouchedPublish] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | "source" | null>(null);
  const [jdText, setJdText] = useState("");
  const [parsingJd, setParsingJd] = useState(false);
  const [jdError, setJdError] = useState<string | null>(null);
  const [jdSummary, setJdSummary] = useState<string | null>(null);

  function update<K extends keyof JobFormState>(key: K, value: JobFormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function autofillFromJd() {
    const text = jdText.trim();
    if (text.length < 40) {
      setJdError("Paste a fuller job description (at least 40 characters).");
      return;
    }
    setParsingJd(true);
    setJdError(null);
    setJdSummary(null);
    try {
      const parsed = await jobsApi.parseJd(text);
      setForm((previous) => applyParsedJd(previous, parsed));
      setJdSummary(parsed.summary || "Fields filled from the pasted JD.");
      setErrors({});
      document
        .getElementById("job-basic-details")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setJdError(getApiErrorMessage(error, "Unable to parse this job description."));
    } finally {
      setParsingJd(false);
    }
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!form.title.trim()) next.title = "Job title is required.";
    if (!form.department) next.department = "Select a department.";
    if (!form.location) next.location = "Select a location.";
    const openings = Number(form.openings);
    if (!form.openings || Number.isNaN(openings) || openings < 1) {
      next.openings = "Enter at least 1 opening.";
    }
    return next;
  }

  async function persist(mode: "draft" | "publish" | "source") {
    const nextErrors = validate();
    setErrors(nextErrors);
    setTouchedPublish(mode !== "draft");

    if (mode !== "draft" && Object.keys(nextErrors).length > 0) {
      document
        .getElementById("job-basic-details")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setSaving(mode);
    try {
      const created = await jobsApi.create({
        title: form.title.trim(),
        department: form.department || null,
        employmentType: form.employmentType,
        workplaceType: form.workplaceType,
        location: form.location || undefined,
        experienceMin: Number(form.experienceMin) || 0,
        experienceMax: Number(form.experienceMax) || 0,
        requiredSkills: form.requiredSkills,
        preferredSkills: form.preferredSkills,
        seniority: form.seniority || null,
        industryPreference: form.industryPreference || undefined,
        education: form.education || undefined,
        description: form.description || undefined,
        responsibilities: form.responsibilities || undefined,
        requirements: form.requirements || undefined,
        benefits: form.benefits || undefined,
        minSalary: form.minSalary ? Number(form.minSalary) : undefined,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
        currency: form.currency,
        salaryVisibility: form.salaryVisibility,
        openings: Number(form.openings) || 1,
        aiScreeningEnabled: form.aiScreeningEnabled,
        assessmentEnabled: form.assessmentEnabled,
        priority: form.priority.toLowerCase(),
        targetClosingDate: form.targetClosingDate || null,
        tags: form.tags
          ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
        internalNotes: form.internalNotes || null,
        publish: mode === "publish" || mode === "source",
      });

      if (mode === "source") {
        router.push(ROUTES.search);
        return;
      }
      router.push(mode === "draft" ? ROUTES.jobs : jobDetailPath(created.id));
    } catch (error) {
      setErrors({
        title: getApiErrorMessage(error, "Unable to save job."),
      });
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Create Job"
        description="Define the hiring requirement once — then reuse it across search, outreach, screening and interviews."
        actions={
          <div className="flex items-center gap-2">
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="outline" type="button">
                  Cancel
                </Button>
              }
              title="Discard this job?"
              description="Unsaved changes will be lost. You can always create the requirement again later."
              confirmLabel="Discard"
              destructive
              onConfirm={() => router.push(ROUTES.jobs)}
            />
            <ConfirmDialog
              trigger={
                <Button size="sm" type="button" disabled={saving !== null}>
                  {saving === "publish" ? "Publishing…" : "Publish Job"}
                </Button>
              }
              title="Publish this job?"
              description="Publishing makes the requirement available for sourcing, outreach and scheduling across your workspace."
              confirmLabel="Publish Job"
              onConfirm={() => persist("publish")}
            />
          </div>
        }
      />

      {touchedPublish && Object.keys(errors).length > 0 ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          Fix the highlighted fields in Role details before publishing.
        </div>
      ) : null}

      <form
        className="space-y-7"
        onSubmit={(event) => {
          event.preventDefault();
          persist("publish");
        }}
      >
        <FormSection
          title="Paste job description"
          description="Paste a JD and let Gemini fill title, skills, experience, location, and description fields."
        >
          <div className="space-y-3">
            <Textarea
              id="job-jd-paste"
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
              placeholder="Paste the full job description here…"
              rows={8}
              className="min-h-40 font-mono text-sm"
              aria-label="Paste job description"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => void autofillFromJd()}
                disabled={parsingJd || jdText.trim().length < 40}
              >
                <Sparkles aria-hidden />
                {parsingJd ? "Extracting…" : "Autofill with AI"}
              </Button>
              {jdText.trim() ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setJdText("");
                    setJdError(null);
                    setJdSummary(null);
                  }}
                  disabled={parsingJd}
                >
                  Clear
                </Button>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Review every field after autofill — AI can miss or invent details.
              </p>
            </div>
            {jdError ? (
              <p role="alert" className="text-sm text-destructive">
                {jdError}
              </p>
            ) : null}
            {jdSummary ? (
              <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {jdSummary}
              </p>
            ) : null}
          </div>
        </FormSection>

        <FormSection
          title="Role details"
          description="Core identity of the hiring requirement."
          bordered={false}
          className="scroll-mt-24"
        >
          <div id="job-basic-details" className="grid gap-4 sm:grid-cols-2">
            <Field id="title" label="Job title" required error={errors.title}>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
            </Field>
            <Field
              id="department"
              label="Department"
              required
              error={errors.department}
            >
              <Select
                value={form.department || null}
                onValueChange={(value) => update("department", value ?? "")}
              >
                <SelectTrigger
                  id="department"
                  className="w-full"
                  aria-invalid={Boolean(errors.department)}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_DEPARTMENTS.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="employmentType" label="Employment type">
              <Select
                value={form.employmentType}
                onValueChange={(value) =>
                  value && update("employmentType", value)
                }
              >
                <SelectTrigger id="employmentType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="workplaceType" label="Workplace type">
              <Select
                value={form.workplaceType}
                onValueChange={(value) =>
                  value && update("workplaceType", value)
                }
              >
                <SelectTrigger id="workplaceType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKPLACE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="openings" label="Number of openings" required error={errors.openings}>
              <Input
                id="openings"
                type="number"
                min={1}
                value={form.openings}
                onChange={(event) => update("openings", event.target.value)}
                aria-invalid={Boolean(errors.openings)}
              />
            </Field>
            <Field id="location" label="Location" required error={errors.location}>
              <Select
                value={form.location || null}
                onValueChange={(value) => update("location", value ?? "")}
              >
                <SelectTrigger
                  id="location"
                  className="w-full"
                  aria-invalid={Boolean(errors.location)}
                >
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Candidate requirements"
          description="Who you are looking for — reused by AI search and People Scout."
          bordered={false}
          className="border-t border-border pt-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="experienceMin" label="Minimum experience (years)">
              <Input
                id="experienceMin"
                type="number"
                min={0}
                value={form.experienceMin}
                onChange={(event) => update("experienceMin", event.target.value)}
              />
            </Field>
            <Field id="experienceMax" label="Maximum experience (years)">
              <Input
                id="experienceMax"
                type="number"
                min={0}
                value={form.experienceMax}
                onChange={(event) => update("experienceMax", event.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <SkillChips
                label="Required skills"
                skills={form.requiredSkills}
                suggestions={SKILL_SUGGESTIONS}
                onAdd={(skill) =>
                  update(
                    "requiredSkills",
                    form.requiredSkills.includes(skill)
                      ? form.requiredSkills
                      : [...form.requiredSkills, skill]
                  )
                }
                onRemove={(skill) =>
                  update(
                    "requiredSkills",
                    form.requiredSkills.filter((item) => item !== skill)
                  )
                }
              />
            </div>
            <div className="sm:col-span-2">
              <SkillChips
                label="Preferred skills"
                skills={form.preferredSkills}
                suggestions={SKILL_SUGGESTIONS}
                onAdd={(skill) =>
                  update(
                    "preferredSkills",
                    form.preferredSkills.includes(skill)
                      ? form.preferredSkills
                      : [...form.preferredSkills, skill]
                  )
                }
                onRemove={(skill) =>
                  update(
                    "preferredSkills",
                    form.preferredSkills.filter((item) => item !== skill)
                  )
                }
              />
            </div>
            <Field id="seniority" label="Seniority">
              <Select
                value={form.seniority}
                onValueChange={(value) => value && update("seniority", value)}
              >
                <SelectTrigger id="seniority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SENIORITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="industryPreference" label="Industry preference">
              <Input
                id="industryPreference"
                value={form.industryPreference}
                onChange={(event) =>
                  update("industryPreference", event.target.value)
                }
                placeholder="e.g. Fintech, SaaS"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field id="education" label="Education requirements">
                <Input
                  id="education"
                  value={form.education}
                  onChange={(event) => update("education", event.target.value)}
                  placeholder="e.g. B.E. / B.Tech in Computer Science or equivalent"
                />
              </Field>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Job description"
          description="Narrative shared with candidates and used to ground AI screening."
          bordered={false}
          className="border-t border-border pt-7"
        >
          <Field
            id="description"
            label="Rich text editor"
            hint="Placeholder editor — paste or type the full job description."
          >
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3">
              <div className="mb-2 flex flex-wrap gap-1 border-b border-border pb-2 text-xs text-muted-foreground">
                {["Bold", "Italic", "Bullets", "Link", "Heading"].map((tool) => (
                  <span
                    key={tool}
                    className="rounded-md border border-border bg-card px-2 py-1"
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Describe the mission, team and impact of this role…"
                className="min-h-32 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
          </Field>
          <Field id="responsibilities" label="Responsibilities">
            <Textarea
              id="responsibilities"
              value={form.responsibilities}
              onChange={(event) => update("responsibilities", event.target.value)}
              placeholder="One responsibility per line"
              className="min-h-24"
            />
          </Field>
          <Field id="requirements" label="Requirements">
            <Textarea
              id="requirements"
              value={form.requirements}
              onChange={(event) => update("requirements", event.target.value)}
              placeholder="One requirement per line"
              className="min-h-24"
            />
          </Field>
          <Field id="benefits" label="Benefits">
            <Textarea
              id="benefits"
              value={form.benefits}
              onChange={(event) => update("benefits", event.target.value)}
              placeholder="One benefit per line"
              className="min-h-20"
            />
          </Field>
        </FormSection>

        <FormSection
          title="Compensation"
          description="Optional for drafts — recommended before publishing."
          bordered={false}
          className="border-t border-border pt-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="minSalary" label="Minimum salary">
              <Input
                id="minSalary"
                type="number"
                min={0}
                value={form.minSalary}
                onChange={(event) => update("minSalary", event.target.value)}
                placeholder="3200000"
              />
            </Field>
            <Field id="maxSalary" label="Maximum salary">
              <Input
                id="maxSalary"
                type="number"
                min={0}
                value={form.maxSalary}
                onChange={(event) => update("maxSalary", event.target.value)}
                placeholder="4800000"
              />
            </Field>
            <Field id="currency" label="Currency">
              <Select
                value={form.currency}
                onValueChange={(value) => value && update("currency", value)}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="salaryVisibility" label="Salary visibility">
              <Select
                value={form.salaryVisibility}
                onValueChange={(value) =>
                  value && update("salaryVisibility", value)
                }
              >
                <SelectTrigger id="salaryVisibility" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_VISIBILITY.map((visibility) => (
                    <SelectItem key={visibility} value={visibility}>
                      {visibility}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Hiring team"
          description="Owners who drive sourcing, decisions and interviews."
          bordered={false}
          className="border-t border-border pt-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="recruiter" label="Recruiter">
              <Select
                value={form.recruiter}
                onValueChange={(value) => value && update("recruiter", value)}
              >
                <SelectTrigger id="recruiter" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_RECRUITERS.map((recruiter) => (
                    <SelectItem key={recruiter} value={recruiter}>
                      {recruiter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="hiringManager" label="Hiring manager">
              <Select
                value={form.hiringManager || null}
                onValueChange={(value) => update("hiringManager", value ?? "")}
              >
                <SelectTrigger id="hiringManager" className="w-full">
                  <SelectValue placeholder="Select hiring manager" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_HIRING_MANAGERS.map((manager) => (
                    <SelectItem key={manager} value={manager}>
                      {manager}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field
                id="interviewPanel"
                label="Interview panel"
                hint="Comma-separated names of panel members."
              >
                <Input
                  id="interviewPanel"
                  value={form.interviewPanel}
                  onChange={(event) =>
                    update("interviewPanel", event.target.value)
                  }
                  placeholder="Vikram Shah, Aditya Rao"
                />
              </Field>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Screening preferences"
          description="Knockout rules and AI evaluation defaults for this job."
          bordered={false}
          className="border-t border-border pt-7"
        >
          <Field id="screeningObjective" label="Screening objective">
            <Textarea
              id="screeningObjective"
              value={form.screeningObjective}
              onChange={(event) =>
                update("screeningObjective", event.target.value)
              }
              placeholder="What should the AI voice agent validate?"
              className="min-h-20"
            />
          </Field>
          <Field
            id="knockoutQuestions"
            label="Knockout questions"
            hint="One question per line."
          >
            <Textarea
              id="knockoutQuestions"
              value={form.knockoutQuestions}
              onChange={(event) =>
                update("knockoutQuestions", event.target.value)
              }
              placeholder="Do you have 5+ years of backend experience?"
              className="min-h-24"
            />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">
                AI screening enabled
              </p>
              <p className="text-xs text-muted-foreground">
                Allow conversational AI voice agents to qualify candidates for this job.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.aiScreeningEnabled}
              onClick={() =>
                update("aiScreeningEnabled", !form.aiScreeningEnabled)
              }
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                form.aiScreeningEnabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-0.5 left-0.5 size-6 rounded-full bg-background shadow transition-transform",
                  form.aiScreeningEnabled && "translate-x-5"
                )}
              />
              <span className="sr-only">Toggle AI screening</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">
                Skills assessments enabled
              </p>
              <p className="text-xs text-muted-foreground">
                Allow assessment campaigns and scorecards for candidates on this job.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.assessmentEnabled}
              onClick={() =>
                update("assessmentEnabled", !form.assessmentEnabled)
              }
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                form.assessmentEnabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-0.5 left-0.5 size-6 rounded-full bg-background shadow transition-transform",
                  form.assessmentEnabled && "translate-x-5"
                )}
              />
              <span className="sr-only">Toggle skills assessments</span>
            </button>
          </div>
          <div className="space-y-2">
            <Label>Required evaluation fields</Label>
            <div className="flex flex-wrap gap-2">
              {EVALUATION_FIELD_OPTIONS.map((field) => {
                const active = form.evaluationFields.includes(field);
                return (
                  <button
                    key={field}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      update(
                        "evaluationFields",
                        active
                          ? form.evaluationFields.filter((item) => item !== field)
                          : [...form.evaluationFields, field]
                      )
                    }
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      active
                        ? "border-primary bg-brand-subtle text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {field}
                  </button>
                );
              })}
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Internal settings"
          description="Planning fields visible only to your hiring team."
          bordered={false}
          className="border-t border-border pt-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="priority" label="Priority">
              <Select
                value={form.priority}
                onValueChange={(value) => value && update("priority", value)}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="targetClosingDate" label="Target closing date">
              <Input
                id="targetClosingDate"
                type="date"
                value={form.targetClosingDate}
                onChange={(event) =>
                  update("targetClosingDate", event.target.value)
                }
              />
            </Field>
            <Field id="tags" label="Tags" hint="Comma-separated labels.">
              <Input
                id="tags"
                value={form.tags}
                onChange={(event) => update("tags", event.target.value)}
                placeholder="backend, platform, priority"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field id="internalNotes" label="Internal notes">
                <Textarea
                  id="internalNotes"
                  value={form.internalNotes}
                  onChange={(event) =>
                    update("internalNotes", event.target.value)
                  }
                  placeholder="Budget notes, stakeholder preferences, alignment with leadership…"
                  className="min-h-24"
                />
              </Field>
            </div>
          </div>
        </FormSection>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              nativeButton={false}
              render={<Link href={ROUTES.jobs} />}
            >
              Back to Jobs
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={saving !== null}
                onClick={() => persist("draft")}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={saving !== null}
              >
                Publish Job
              </Button>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                disabled={saving !== null}
                onClick={() => persist("source")}
              >
                Save and Source Candidates
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
