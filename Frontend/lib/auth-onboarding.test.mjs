/**
 * Frontend unit checks for post-auth redirects and onboarding step validation.
 * Run: node Frontend/lib/auth-onboarding.test.mjs
 */

function postAuthPath(user) {
  if (!user) return "/login";
  if (user.platformAdmin) return "/admin/dashboard";
  const accountRole = user.accountRole ?? (user.role === "owner" ? "owner" : "member");
  if (accountRole === "member") return "/dashboard";
  const incomplete =
    typeof user.onboardingCompleted === "boolean"
      ? !user.onboardingCompleted
      : user.onboardingStatus !== "completed";
  if (incomplete) return "/onboarding";
  return "/dashboard";
}

function sanitizeInternalPath(path, fallback = "/dashboard") {
  if (!path) return fallback;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  return trimmed;
}

function resolvePostAuthDestination(user, preferredPath) {
  const base = postAuthPath(user);
  if (base === "/onboarding" || base === "/admin/dashboard" || base === "/login") return base;
  return sanitizeInternalPath(preferredPath, base);
}

function isStepValid(step, answers) {
  switch (step) {
    case 0:
      return true;
    case 1:
      return Boolean(answers.companyType);
    case 2:
      return answers.hiringChallenges.length > 0;
    case 3:
      return answers.outreachChannels.length > 0;
    case 4:
      return Boolean(answers.hiringVolume);
    default:
      return false;
  }
}

function validateSignup(form) {
  if (!form.fullName.trim()) return "Full name is required.";
  if (!form.companyName.trim()) return "Company name is required.";
  if (!form.email.trim()) return "Work email is required.";
  if (!form.mobile.trim()) return "Mobile number is required.";
  if (form.password.length < 8) return "Password must be at least 8 characters.";
  if (form.password !== form.confirmPassword) return "Passwords do not match.";
  return null;
}

const cases = [
  [
    "owner signup -> onboarding",
    postAuthPath({ role: "owner", accountRole: "owner", onboardingCompleted: false }),
    "/onboarding",
  ],
  [
    "admin -> admin dashboard",
    postAuthPath({ role: "owner", accountRole: "owner", platformAdmin: true, onboardingCompleted: false }),
    "/admin/dashboard",
  ],
  [
    "member skips onboarding",
    postAuthPath({ role: "recruiter", accountRole: "member", onboardingCompleted: false }),
    "/dashboard",
  ],
  [
    "completed owner -> dashboard",
    postAuthPath({ role: "owner", accountRole: "owner", onboardingCompleted: true }),
    "/dashboard",
  ],
  [
    "claimed search waits until onboarding done",
    resolvePostAuthDestination(
      { role: "owner", accountRole: "owner", onboardingCompleted: false },
      "/dashboard/sessions/abc"
    ),
    "/onboarding",
  ],
  [
    "claimed search after onboarding",
    resolvePostAuthDestination(
      { role: "owner", accountRole: "owner", onboardingCompleted: true },
      "/dashboard/sessions/abc"
    ),
    "/dashboard/sessions/abc",
  ],
  [
    "blocks open redirect",
    sanitizeInternalPath("https://evil.example", "/dashboard"),
    "/dashboard",
  ],
  ["welcome step valid", isStepValid(0, { companyType: null, hiringChallenges: [], outreachChannels: [], hiringVolume: null }), true],
  ["company requires selection", isStepValid(1, { companyType: null, hiringChallenges: [], outreachChannels: [], hiringVolume: null }), false],
  ["challenges require one", isStepValid(2, { companyType: "startup", hiringChallenges: [], outreachChannels: [], hiringVolume: null }), false],
  ["channels require one", isStepValid(3, { companyType: "startup", hiringChallenges: ["screening"], outreachChannels: [], hiringVolume: null }), false],
  ["volume requires one", isStepValid(4, { companyType: "startup", hiringChallenges: ["screening"], outreachChannels: ["email"], hiringVolume: null }), false],
  [
    "signup validation",
    validateSignup({
      fullName: "Ananya",
      companyName: "Acme",
      email: "a@b.com",
      mobile: "9876543210",
      password: "Password123",
      confirmPassword: "Password123",
    }),
    null,
  ],
  [
    "signup password mismatch",
    validateSignup({
      fullName: "Ananya",
      companyName: "Acme",
      email: "a@b.com",
      mobile: "9876543210",
      password: "Password123",
      confirmPassword: "nope",
    }),
    "Passwords do not match.",
  ],
];

let failed = 0;
for (const [name, actual, expected] of cases) {
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok ${name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log("All auth/onboarding frontend checks passed.");
