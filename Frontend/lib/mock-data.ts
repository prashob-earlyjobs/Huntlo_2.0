import type { AppNotification, Candidate, CreditMetric, MockUser, Workspace } from "@/lib/types"

export const MOCK_USER: MockUser = {
  name: "Ananya Sharma",
  role: "Lead Recruiter",
  organisation: "Huntlo Talent",
  email: "ananya@huntlo.ai",
  initials: "AS",
  plan: "Growth Plan",
}

export const WORKSPACES: Workspace[] = [
  { id: "ws-1", name: "Huntlo Talent", plan: "Growth", initials: "HT" },
  { id: "ws-2", name: "Enterprise Hiring", plan: "Scale", initials: "EH" },
  { id: "ws-3", name: "Exec Search", plan: "Starter", initials: "ES" },
]

export const CREDIT_SUMMARY = {
  searchesRemaining: 184,
  searchesTotal: 300,
}

export const CREDIT_METRICS: CreditMetric[] = [
  { id: "searches", label: "Search credits", used: 116, total: 300 },
  { id: "email-reveals", label: "Email reveals", used: 420, total: 1000 },
  { id: "mobile-reveals", label: "Mobile reveals", used: 96, total: 250 },
  { id: "email-outreach", label: "Email outreach", used: 1248, total: 5000 },
  { id: "whatsapp", label: "WhatsApp outreach", used: 386, total: 2000 },
  { id: "voice", label: "AI voice minutes", used: 74, total: 500, unit: "min" },
]

export const CANDIDATES: Candidate[] = [
  {
    id: "cand-1",
    name: "Priya Nair",
    title: "Senior Backend Engineer",
    company: "Finovate Labs",
    location: "Bengaluru",
    matchScore: 92,
    status: "Shortlisted",
    skills: ["Node.js", "AWS", "Kafka"],
    emailRevealed: true,
    phoneRevealed: false,
  },
  {
    id: "cand-2",
    name: "Rahul Menon",
    title: "Staff Frontend Engineer",
    company: "Pixelworks",
    location: "Pune",
    matchScore: 87,
    status: "Interested",
    skills: ["React", "TypeScript"],
    emailRevealed: true,
    phoneRevealed: true,
  },
  {
    id: "cand-3",
    name: "Farah Sheikh",
    title: "Product Designer",
    company: "Craftline",
    location: "Mumbai",
    matchScore: 81,
    status: "Contacted",
    skills: ["Figma", "Research"],
    emailRevealed: false,
    phoneRevealed: false,
  },
]

export const RECENT_SEARCHES = [
  "Senior backend engineers in Bengaluru with Kafka",
  "Enterprise AEs in Mumbai with SaaS experience",
  "Product designers with B2B workflow portfolio",
]

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "New reply in Backend Engineer sequence",
    description: "Priya Nair replied and is open to a screening call this week.",
    time: "12m ago",
    read: false,
    kind: "campaign",
  },
  {
    id: "notif-2",
    title: "Interview confirmed",
    description: "Technical panel booked for Rahul Menon tomorrow at 11:00 AM.",
    time: "1h ago",
    read: false,
    kind: "interview",
  },
  {
    id: "notif-3",
    title: "Search credits running low",
    description: "184 search credits remain in the current billing cycle.",
    time: "Today",
    read: true,
    kind: "usage",
  },
]
