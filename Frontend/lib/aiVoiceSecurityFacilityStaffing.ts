import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_SECURITY_FACILITY_STAFFING_PATH =
  "/in/ai-voice-security-facility-staffing";

export const AI_VOICE_SECURITY_FACILITY_STAFFING_SEO = {
  title: "AI Voice Recruitment for Facility Staffing | Huntlo",
  description:
    "Explore AI voice recruitment workflows for security and facility staffing, including candidate outreach, shift availability, location checks, and screening coordination.",
  ogTitle:
    "Facility Staffing Needs People at the Right Site, on the Right Shift, at the Right Time.",
  ogDescription:
    "AI voice recruitment for security and facility staffing supports structured first-contact calling, location checks, shift availability questions, and routine recruitment coordination.",
} as const;

export function aiVoiceSecurityFacilityStaffingMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_SECURITY_FACILITY_STAFFING_SEO.title,
    description: AI_VOICE_SECURITY_FACILITY_STAFFING_SEO.description,
    ogTitle: AI_VOICE_SECURITY_FACILITY_STAFFING_SEO.ogTitle,
    ogDescription: AI_VOICE_SECURITY_FACILITY_STAFFING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_SECURITY_FACILITY_STAFFING_PATH,
  });
}

export const AI_VOICE_SECURITY_FACILITY_STAFFING_GEO = {
  askTopic: "Huntlo AI voice recruitment for security and facility staffing",
  askPrompt:
    "What is AI voice recruitment for security and facility staffing on Huntlo at /in/ai-voice-security-facility-staffing (https://www.huntlo.ai/in/ai-voice-security-facility-staffing)? How do structured automated calls support candidate outreach, shift availability, location checks, and screening coordination in India?",
} as const;

export const FACILITY_ROLE_REQUIREMENTS = [
  {
    role: "Security staff",
    site: "Commercial property, gated site",
    focus: "Shift pattern, site posting, eligibility process",
    note: "Verification follows employer procedure",
  },
  {
    role: "Housekeeping personnel",
    site: "Commercial or residential facility",
    focus: "Location, duties, shift arrangements",
    note: "Role details differ per site",
  },
  {
    role: "Facility technicians",
    site: "Expanding operations team",
    focus: "Technical qualifications, schedule, site access",
    note: "Later-stage assessment required",
  },
] as const;

export const FACILITY_VOICE_WORKFLOW = [
  {
    step: "Define the staffing requirement",
    detail:
      "Document the site, role, schedule, essential criteria, and recruitment process.",
  },
  {
    step: "Prepare candidate outreach",
    detail: "Review contact information and appropriate permissions.",
  },
  {
    step: "Design role-specific questions",
    detail: "Use clear language focused on relevant requirements.",
  },
  {
    step: "Conduct initial engagement",
    detail:
      "Explain the opportunity and gather candidate interest or availability information.",
  },
  {
    step: "Organize responses",
    detail:
      "Distinguish interested candidates, location constraints, shift preferences, questions, and callback requests.",
  },
  {
    step: "Route for recruiter review",
    detail:
      "Provide relevant information for human assessment and next-stage decisions.",
  },
  {
    step: "Support interview coordination",
    detail:
      "Where verified capabilities permit, coordinate appropriate reminders and scheduling-related communication.",
  },
] as const;

export const FACILITY_RESPONSE_TYPES = [
  {
    response: "Interested in the site",
    next: "Recruiter reviews availability and next steps",
  },
  {
    response: "Location is not workable",
    next: "Note the constraint and stop pursuing that site",
  },
  {
    response: "Shift does not match",
    next: "Check whether another requirement fits",
  },
  {
    response: "Needs more information",
    next: "Provide approved details or arrange a callback",
  },
] as const;

export const FACILITY_TRUST_PRINCIPLES = [
  {
    title: "Verification stays human",
    detail:
      "Documentation, training, background checks, and other requirements follow the employer's approved procedures and applicable legal requirements.",
  },
  {
    title: "A response is not a proof",
    detail:
      "An automated voice response is not proof that a candidate satisfies every condition for a security or facility role.",
  },
  {
    title: "Site accuracy",
    detail:
      "Candidates need correct information about the location and role being discussed; sites and positions are not interchangeable.",
  },
  {
    title: "Responsible calling",
    detail:
      "Calls should identify the recruiting organization, allow human assistance, avoid unnecessary repetition, and let candidates decline further contact.",
  },
] as const;

export const FACILITY_INTERNAL_LINKS = [
  {
    label: "AI Voice Recruitment for Logistics Hiring",
    href: "/in/ai-voice-logistics-warehouse-hiring",
  },
  {
    label: "AI Voice Retail Frontline Hiring",
    href: "/in/ai-voice-retail-frontline-hiring",
  },
  {
    label: "AI Voice Candidate Availability Screening",
    href: "/in/ai-voice-candidate-availability-screening",
  },
] as const;

export const AI_VOICE_SECURITY_FACILITY_STAFFING_FAQS = [
  {
    question: "How can AI voice support facility staffing recruitment?",
    answer:
      "AI voice can support structured candidate outreach, location-related questions, shift availability checks, and selected recruitment follow-ups.",
  },
  {
    question: "Can AI calling help security staffing agencies?",
    answer:
      "It may support routine first-contact communication when workflows are appropriately designed and required verification remains under human control.",
  },
  {
    question: "Can AI voice verify security staff qualifications?",
    answer:
      "A voice conversation may gather information, but required qualifications and documentation must be verified through appropriate processes.",
  },
  {
    question: "Is AI voice useful for multi-site facility hiring?",
    answer:
      "It may support site-specific candidate communication when accurate requirements, appropriate permissions, and human oversight are maintained.",
  },
] as const;
