import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AUTOMATED_CANDIDATE_FOLLOW_UP_PATH = "/automated-candidate-follow-up";

export const AUTOMATED_CANDIDATE_FOLLOW_UP_SEO = {
  title: "Automated Candidate Follow-Up Software | Huntlo",
  description:
    "Cut missed conversations with recruiter-led automated candidate follow-up: clear cadence, stop conditions, and human takeover when a reply or opt-out arrives.",
  ogTitle: "The candidate who did not reply may still be the right candidate.",
  ogDescription:
    "Rules-based follow-up with clear cadence, stop conditions, and human takeover - so silence does not end the conversation by accident.",
} as const;

export function automatedCandidateFollowUpMetadata() {
  return buildPageMetadata({
    title: AUTOMATED_CANDIDATE_FOLLOW_UP_SEO.title,
    description: AUTOMATED_CANDIDATE_FOLLOW_UP_SEO.description,
    ogTitle: AUTOMATED_CANDIDATE_FOLLOW_UP_SEO.ogTitle,
    ogDescription: AUTOMATED_CANDIDATE_FOLLOW_UP_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AUTOMATED_CANDIDATE_FOLLOW_UP_PATH,
  });
}

export const AUTOMATED_CANDIDATE_FOLLOW_UP_GEO = {
  askTopic: "Huntlo automated candidate follow-up",
  askPrompt:
    "What is automated candidate follow-up on Huntlo at /automated-candidate-follow-up (https://www.huntlo.ai/automated-candidate-follow-up)? How do cadence, stop conditions, and human takeover work when a candidate replies or opts out?",
} as const;

export const HERO_THREAD = [
  {
    from: "recruiter",
    label: "Day 1 · Email",
    body: "Hi Alex - saw your work on distributed systems. Open to a product engineering conversation?",
  },
  {
    from: "system",
    label: "No reply",
    body: "Sequence continues on schedule.",
  },
  {
    from: "recruiter",
    label: "Day 4 · Reminder",
    body: "Sharing one more note with role context. Happy to close the loop either way.",
  },
  {
    from: "candidate",
    label: "Reply",
    body: "Interested - traveling this week. Can we talk next Monday?",
  },
  {
    from: "system",
    label: "Automation paused",
    body: "Reply detected → sequence stops. Recruiter owns the next step.",
  },
] as const;

export const SEQUENCE_TIMELINE = [
  { day: "Day 1", action: "Opening message", branch: "continue" as const },
  { day: "Day 4", action: "Context reminder", branch: "continue" as const },
  { day: "Day 8", action: "Closing touch", branch: "continue" as const },
  { day: "Any time", action: "Reply → pause", branch: "stop" as const },
] as const;

export const SILENCE_POINTS = [
  "Busy calendars, travel, and competing priorities often delay a reply that still becomes a yes.",
  "A single unanswered message is a signal to wait thoughtfully - not proof of rejection.",
  "Follow-up exists to reopen the door with context, not to pressure a decision.",
] as const;

export const CONTEXT_NOT_PRESSURE = [
  {
    title: "Lead with relevance",
    description: "Reference the role, the reason for outreach, and what changed since the last touch.",
  },
  {
    title: "Offer an easy out",
    description: "Make it simple to decline or defer. Respect reduces friction and protects brand trust.",
  },
  {
    title: "Know when to stop",
    description: "Every sequence needs a clear end. Endless reminders turn interest into noise.",
  },
] as const;

export const PRODUCT_ENG_SEQUENCE = [
  {
    step: "01",
    title: "Opening",
    detail: "Product engineering role: cite a specific project signal and invite a short conversation.",
  },
  {
    step: "02",
    title: "Context reminder",
    detail: "If silent, share one clarifying detail about scope or team - not a copy of message one.",
  },
  {
    step: "03",
    title: "Closing touch",
    detail: "A final note that leaves the door open and ends the automated path.",
  },
  {
    step: "04",
    title: "Reply → pause",
    detail: "Any reply or opt-out interrupts automation so the next action reflects candidate intent.",
  },
] as const;

export const CONTROL_CARDS = [
  {
    title: "Cadence",
    description:
      "Define spacing that matches role urgency and candidate expectations - restrained by default.",
    points: ["Start / middle / close touches", "Spacing you can explain", "Role-specific templates"],
  },
  {
    title: "Stop conditions",
    description:
      "Replies, opt-outs, and recruiter stops should interrupt the sequence immediately.",
    points: ["Reply detected", "Opt-out honored", "Manual stop available"],
  },
  {
    title: "Human takeover",
    description:
      "When a candidate engages, ownership returns to the recruiter with conversation context intact.",
    points: ["Pause automation", "Surface last intent", "Choose the next step"],
  },
] as const;

export const QUALITY_MEASURES = [
  {
    title: "Conversation quality",
    description: "Did follow-ups reopen useful dialogue - or only generate activity?",
  },
  {
    title: "Respect for intent",
    description: "Did replies and opt-outs stop automation without delay?",
  },
  {
    title: "Recruiter clarity",
    description: "Could a teammate see what was sent, what paused, and what to do next?",
  },
  {
    title: "Sequence hygiene",
    description: "Did every motion have a beginning, a restrained middle, and a clear end?",
  },
] as const;

export const START_MOTION = {
  title: "Start with one outreach motion",
  body: "Pick a single role family and document cadence, stop rules, and who takes over after a reply. Pilot before expanding. Related reading: Huntlo Hiring Momentum on /follow-up-automation - different positioning, complementary ideas.",
} as const;

export const DEMO_TIP = {
  title: "Demo tip",
  body: "Ask the walkthrough to confirm channels and triggers for your team: which channels send follow-ups, what events pause a sequence, and how a recruiter resumes after a delayed yes. Confirm behavior in the demo - do not assume.",
} as const;

export const AUTOMATED_CANDIDATE_FOLLOW_UP_FAQS = [
  {
    question: "What is automated candidate follow-up?",
    answer:
      "It is a rules-based process for sending and stopping candidate reminders based on timing and responses.",
  },
  {
    question: "How many follow-ups should recruiters send?",
    answer:
      "There is no universal number. Use a restrained cadence based on candidate expectations, relevance, and applicable outreach rules.",
  },
  {
    question: "Should follow-ups stop after a reply?",
    answer:
      "Yes. Replies and opt-outs should interrupt automation so the next action reflects the candidate's intent.",
  },
  {
    question: "How does follow-up connect to ATS handoff?",
    answer:
      "When a candidate replies or is marked ready, recruiters can advance the record and sync status into the ATS—so engagement history stays connected to the hiring pipeline.",
  },
] as const;
