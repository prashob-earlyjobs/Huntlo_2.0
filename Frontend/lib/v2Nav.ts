/**
 * V2 marketing IA — shared by homepage chrome (header + footer).
 * Child pages may still be stubs until page content is approved one-by-one.
 */

import { CALENDLY_BOOK_DEMO_URL } from "@/lib/calendly";

export const V2_HOME_PATH = "/";
/** External Calendly booking link (opens in a new tab from CTAs). */
export const V2_BOOK_DEMO_PATH = CALENDLY_BOOK_DEMO_URL;
export const V2_SIGN_IN_PATH = "/login";
export const V2_PLATFORM_HUB_PATH = "/platform";
/** Hub removed — Solutions nav points at the primary Solutions landing page. */
export const V2_SOLUTIONS_HUB_PATH = "/solutions/ai-hiring-agents";

export type V2NavItem = {
  label: string;
  href: string;
  desc?: string;
};

export const V2_PLATFORM_ITEMS: V2NavItem[] = [
  {
    label: "Huntlo Voice",
    href: "/platform/voice",
    desc: "Illustrative voice workflows for screening and follow-up",
  },
  {
    label: "AI Sourcing",
    href: "/platform/ai-sourcing",
    desc: "Find and organise candidates for open roles",
  },
  {
    label: "AI Engagement",
    href: "/platform/ai-engagement",
    desc: "Outreach and follow-ups across channels",
  },
  {
    label: "Conversation Intelligence",
    href: "/platform/conversation-intelligence",
    desc: "Structured insight from workforce conversations",
  },
];

export const V2_SOLUTIONS_ITEMS: V2NavItem[] = [
  {
    label: "AI Hiring Agents",
    href: "/solutions/ai-hiring-agents",
    desc: "From applicant to interview-ready context",
  },
  {
    label: "AI Onboarding Agents",
    href: "/solutions/ai-onboarding-agents",
    desc: "From offer accepted to Day 1 readiness",
  },
  {
    label: "AI Retention Agents",
    href: "/solutions/ai-retention-agents",
    desc: "Structured check-ins and responsible HR follow-up",
  },
];

export type V2SolutionsMegaTone = "hiring" | "onboarding" | "retention";

export type V2SolutionsMegaLink = {
  label: string;
  href: string;
};

export type V2SolutionsMegaColumn = {
  id: V2SolutionsMegaTone;
  label: string;
  href: string;
  tone: V2SolutionsMegaTone;
  items: readonly V2SolutionsMegaLink[];
};

/** Three-column Solutions mega-menu — every href is an existing route. */
export const V2_SOLUTIONS_MEGA: readonly V2SolutionsMegaColumn[] = [
  {
    id: "hiring",
    label: "Hiring",
    href: "/solutions/ai-hiring-agents",
    tone: "hiring",
    items: [
      { label: "Candidate Sourcing", href: "/platform/ai-sourcing" },
      { label: "AI Screening", href: "/agents/ai-screening-agent" },
      { label: "Candidate Qualification", href: "/solutions/candidate-qualification" },
      { label: "Interview Coordination", href: "/agents/interview-scheduling-agent" },
    ],
  },
  {
    id: "onboarding",
    label: "Onboarding",
    href: "/solutions/ai-onboarding-agents",
    tone: "onboarding",
    items: [
      { label: "Joining Confirmation", href: "/agents/joining-confirmation" },
      { label: "Pre-Joining Follow-ups", href: "/agents/pre-joining-engagement" },
      { label: "Day 1 Readiness", href: "/agents/onboarding-document-readiness" },
      { label: "HR Coordination", href: "/solutions/hr-coordination" },
    ],
  },
  {
    id: "retention",
    label: "Retention",
    href: "/solutions/ai-retention-agents",
    tone: "retention",
    items: [
      { label: "Employee Check-ins", href: "/agents/new-hire-check-in-surveys" },
      { label: "Workforce Feedback", href: "/agents/employee-pulse-surveys" },
      { label: "Concern Identification", href: "/solutions/concern-identification" },
      { label: "HR Follow-ups", href: "/solutions/hr-follow-ups" },
    ],
  },
];

export const V2_INDUSTRY_LINKS: V2NavItem[] = [
  { label: "Recruitment agencies", href: "/ai-recruiting-staffing-agencies" },
  { label: "BPO recruitment", href: "/in/ai-voice-bpo-recruitment" },
  { label: "Logistics & warehouse", href: "/in/ai-voice-logistics-warehouse-hiring" },
  { label: "Retail frontline", href: "/in/ai-voice-retail-frontline-hiring" },
  { label: "Manufacturing", href: "/us/ai-recruiting-automation-manufacturing" },
  { label: "Healthcare staffing", href: "/us/ai-recruiting-automation-healthcare-staffing" },
];

export const V2_RESOURCES_LINKS: V2NavItem[] = [
  { label: "Resources hub", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "AI Voice Recruiter", href: "/ai-voice-recruiter" },
  { label: "AI Sourcing", href: "/sourcing" },
  { label: "Candidate Outreach", href: "/candidate-outreach" },
  { label: "FAQs", href: "/faqs" },
  { label: "Comparisons", href: "/compare" },
];

export const V2_COMPANY_LINKS: V2NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Security", href: "/security" },
];

export const V2_LEGAL_LINKS: V2NavItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export const V2_PRIMARY_LINKS: V2NavItem[] = [
  { label: "Industries", href: "/industries" },
  { label: "Resources", href: "/resources" },
];
