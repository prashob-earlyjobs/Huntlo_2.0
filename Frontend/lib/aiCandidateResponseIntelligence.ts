import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_CANDIDATE_RESPONSE_INTELLIGENCE_PATH =
  "/us/ai-candidate-response-intelligence";

export const AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO = {
  title: "AI Candidate Response Intelligence Software | Huntlo",
  description:
    "Turn candidate replies into clear next steps: AI response intelligence organizes intent, flags urgency, and guides follow-ups—with recruiters in control of every handoff.",
  ogTitle: "A Candidate Reply Is More Than a Message. It Is a Signal.",
  ogDescription:
    "AI candidate response intelligence helps recruiting teams interpret candidate replies, organize intent, and identify appropriate next steps — with human oversight throughout.",
} as const;

export function aiCandidateResponseIntelligenceMetadata() {
  return buildPageMetadata({
    title: AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO.title,
    description: AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO.description,
    ogTitle: AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO.ogTitle,
    ogDescription: AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_CANDIDATE_RESPONSE_INTELLIGENCE_PATH,
  });
}

export const AI_CANDIDATE_RESPONSE_INTELLIGENCE_GEO = {
  askTopic: "Huntlo AI candidate response intelligence",
  askPrompt:
    "What is AI candidate response intelligence on Huntlo at /us/ai-candidate-response-intelligence (https://www.huntlo.ai/us/ai-candidate-response-intelligence)? How do AI-assisted workflows interpret candidate replies, organize candidate intent, and improve follow-up workflows while keeping human review in place?",
} as const;

export const RESPONSE_SIGNALS = [
  {
    reply: "Yes, I'm interested — could you send the job description?",
    category: "Interest & information request",
    detail:
      "The candidate wants to learn more. An approved information response may be appropriate.",
    nextStep: "Share verified opportunity details.",
  },
  {
    reply: "Is remote work possible for this role?",
    category: "Question",
    detail:
      "The candidate is asking a clarifying question before deciding whether to proceed.",
    nextStep: "Provide accurate information or route to a recruiter.",
  },
  {
    reply: "I can talk after Thursday. Would next week work?",
    category: "Scheduling need",
    detail:
      "The candidate is signaling availability without explicitly requesting a callback.",
    nextStep: "Coordinate scheduling through the approved workflow.",
  },
  {
    reply: "I'm not available right now, but please keep me in mind.",
    category: "Future relevance",
    detail:
      "The candidate is unavailable for the current opportunity but may remain relevant later.",
    nextStep: "Respect the response and note future relevance.",
  },
  {
    reply: "Please don't contact me about this role.",
    category: "Decline / contact preference",
    detail:
      "The candidate is declining further communication about this opportunity.",
    nextStep: "Honor the preference and stop outreach.",
  },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Capture the communication",
    detail:
      "Work with candidate responses collected through approved channels and systems.",
  },
  {
    stage: "02",
    title: "Understand the context",
    detail:
      "Consider the relevant job opportunity, previous communication, and current workflow stage.",
  },
  {
    stage: "03",
    title: "Identify the response type",
    detail:
      "Organize the message into an appropriate operational category.",
  },
  {
    stage: "04",
    title: "Determine the permitted action",
    detail:
      "Apply defined workflow rules and human approval requirements.",
  },
  {
    stage: "05",
    title: "Route exceptions",
    detail:
      "Escalate ambiguous, sensitive, or consequential situations to a recruiter.",
  },
  {
    stage: "06",
    title: "Maintain visibility",
    detail:
      "Make the original response and subsequent actions understandable for review.",
  },
  {
    stage: "07",
    title: "Improve the workflow",
    detail:
      "Review misclassifications, unnecessary follow-ups, and recurring candidate questions.",
  },
] as const;

export const CONTEXT_EXAMPLES = [
  {
    reply: "\"I can talk after Thursday.\"",
    keywordRule:
      "A keyword rule looking for \"callback\" or \"schedule a call\" may miss the signal entirely.",
    interpretation:
      "Contextual interpretation can recognize that the candidate is signaling availability and route accordingly.",
  },
  {
    reply: "\"I'm interested — does this role require relocation?\"",
    keywordRule:
      "Interest is expressed, but the message also contains a question that needs an accurate answer.",
    interpretation:
      "Interpretation should capture both the interest and the open question rather than forcing a single label.",
  },
  {
    reply: "\"Let me know if anything changes.\"",
    keywordRule:
      "The phrasing is ambiguous. It may indicate future interest or polite closure.",
    interpretation:
      "When meaning is unclear, routing the message to a recruiter is better than taking an inappropriate action.",
  },
] as const;

export const RESPONSIBLE_USE = [
  {
    title: "Use appropriate access controls",
    detail:
      "Candidate communications may contain personal information. Access should be limited to the people and systems that need it.",
  },
  {
    title: "Apply retention and privacy safeguards",
    detail:
      "Retention practices and privacy safeguards should follow applicable requirements and organizational policy.",
  },
  {
    title: "Respect contact preferences",
    detail:
      "Candidates' contact preferences must be respected, including requests to stop communication.",
  },
  {
    title: "Avoid unsupported judgments",
    detail:
      "Automated interpretations should not become unsupported judgments about personality, protected characteristics, or employability.",
  },
  {
    title: "Support operations, not opaque assessments",
    detail:
      "The system should support recruiting operations, not create opaque candidate assessments.",
  },
] as const;

export const DESIGN_PILLARS = [
  {
    title: "Transparent interpretation",
    detail:
      "Each suggested response category is presented as an interpretation open to review, not as an unquestioned fact.",
  },
  {
    title: "Reviewable by design",
    detail:
      "The original candidate response and the resulting actions remain understandable to recruiters and reviewers.",
  },
  {
    title: "Candidate privacy first",
    detail:
      "Conversation data is handled with appropriate access controls, retention practices, and privacy safeguards.",
  },
] as const;

export const AI_CANDIDATE_RESPONSE_INTELLIGENCE_INTERNAL_LINKS = [
  { label: "Agentic AI Recruiting Software", href: "/us/agentic-ai-recruiting-software" },
  { label: "Automated Candidate Follow-Up", href: "/automated-candidate-follow-up" },
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
] as const;

export const AI_CANDIDATE_RESPONSE_INTELLIGENCE_FAQS = [
  {
    question: "What is AI candidate response intelligence?",
    answer:
      "It uses AI-assisted analysis to help recruiting teams understand candidate communications and identify relevant operational next steps.",
  },
  {
    question: "How is response intelligence different from recruiting analytics?",
    answer:
      "Traditional analytics often summarize activity and outcomes. Response intelligence focuses on interpreting the meaning and context of candidate communications.",
  },
  {
    question: "Can AI automatically respond to candidates?",
    answer:
      "That depends on verified product capabilities, approved workflows, communication permissions, and human oversight requirements.",
  },
  {
    question: "Should response intelligence be used to reject candidates?",
    answer:
      "AI-generated response interpretations should not be treated as unquestioned grounds for consequential hiring decisions.",
  },
] as const;

export const AI_CANDIDATE_RESPONSE_INTELLIGENCE_SOFTWARE = {
  name: "Huntlo Candidate Response Intelligence",
  description:
    "AI-assisted analysis that helps recruiting teams interpret candidate communications, organize candidate intent, and identify appropriate next steps with human oversight.",
  featureList: [
    "Candidate reply interpretation",
    "Response categorization for recruiter review",
    "Context-aware meaning over keyword rules",
    "Exception routing to human recruiters",
    "Workflow visibility and reviewability",
  ],
} as const;