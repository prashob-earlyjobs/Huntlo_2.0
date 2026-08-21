export type JobFormFieldKey =
  | "title"
  | "department"
  | "location"
  | "openings"
  | "experienceMax"
  | "maxSalary";

export type JobFormFieldErrors = Partial<Record<JobFormFieldKey, string>>;

export const JOB_FORM_FIELD_FOCUS_ORDER: JobFormFieldKey[] = [
  "title",
  "department",
  "location",
  "openings",
  "experienceMax",
  "maxSalary",
];

export const MAX_JOB_OPENINGS = 500;

export type JobFormValidationInput = {
  title: string;
  department: string;
  location: string;
  openings: string;
  experienceMin: string;
  experienceMax: string;
  minSalary: string;
  maxSalary: string;
};

/** Shared by publish/source/draft so UI and API stay aligned. */
export function validateJobForm(
  form: JobFormValidationInput,
  mode: "draft" | "publish" | "source"
): JobFormFieldErrors {
  const next: JobFormFieldErrors = {};
  if (!form.title.trim()) next.title = "Job title is required.";

  if (mode !== "draft") {
    if (!form.department.trim()) next.department = "Select a department.";
    if (!form.location.trim()) next.location = "Select a location.";

    const openingsRaw = form.openings.trim();
    const openings = Number(openingsRaw);
    if (
      !openingsRaw ||
      !Number.isInteger(openings) ||
      openings < 1 ||
      openings > MAX_JOB_OPENINGS
    ) {
      next.openings = `Enter between 1 and ${MAX_JOB_OPENINGS} openings.`;
    }
  } else if (form.openings.trim()) {
    const openings = Number(form.openings);
    if (
      !Number.isInteger(openings) ||
      openings < 1 ||
      openings > MAX_JOB_OPENINGS
    ) {
      next.openings = `Enter between 1 and ${MAX_JOB_OPENINGS} openings.`;
    }
  }

  const expMinRaw = form.experienceMin.trim();
  const expMaxRaw = form.experienceMax.trim();
  if (expMinRaw || expMaxRaw) {
    const expMin = Number(expMinRaw);
    const expMax = Number(expMaxRaw);
    if (
      (expMinRaw && (Number.isNaN(expMin) || expMin < 0 || expMin > 50)) ||
      (expMaxRaw && (Number.isNaN(expMax) || expMax < 0 || expMax > 50))
    ) {
      next.experienceMax = "Experience must be between 0 and 50 years.";
    } else if (
      expMinRaw &&
      expMaxRaw &&
      !Number.isNaN(expMin) &&
      !Number.isNaN(expMax) &&
      expMin > expMax
    ) {
      next.experienceMax =
        "Maximum experience must be greater than or equal to minimum.";
    }
  }

  const minSalaryRaw = form.minSalary.trim();
  const maxSalaryRaw = form.maxSalary.trim();
  if (minSalaryRaw || maxSalaryRaw) {
    const minSalary = Number(minSalaryRaw);
    const maxSalary = Number(maxSalaryRaw);
    if (
      (minSalaryRaw && (Number.isNaN(minSalary) || minSalary < 0)) ||
      (maxSalaryRaw && (Number.isNaN(maxSalary) || maxSalary < 0))
    ) {
      next.maxSalary = "Salary values must be zero or greater.";
    } else if (
      minSalaryRaw &&
      maxSalaryRaw &&
      !Number.isNaN(minSalary) &&
      !Number.isNaN(maxSalary) &&
      minSalary > maxSalary
    ) {
      next.maxSalary =
        "Maximum salary must be greater than or equal to minimum.";
    }
  }

  return next;
}

export function firstInvalidJobFieldId(
  errors: JobFormFieldErrors
): string | null {
  for (const key of JOB_FORM_FIELD_FOCUS_ORDER) {
    if (errors[key]) return key;
  }
  return null;
}
