/** Lifecycle and pipeline statuses rendered by StatusBadge. */
export type Status =
  | "Draft"
  | "Active"
  | "Paused"
  | "On Hold"
  | "Closed"
  | "Archived"
  | "Completed"
  | "Scheduled"
  | "Running"
  | "Failed"
  | "Connected"
  | "Disconnected"
  | "Qualified"
  | "Interested"
  | "Not Interested"
  | "Shortlisted"
  | "Rejected"
  | "Awaiting Response"
  | "Contacted"
  | "Screening"
  | "Interview Scheduled";

/** Job requirement lifecycle statuses. */
export type JobStatus = Extract<
  Status,
  "Draft" | "Active" | "Paused" | "On Hold" | "Closed" | "Archived"
>;

/** Outreach and scheduling channels rendered by ChannelBadge. */
export type Channel = "Email" | "WhatsApp" | "AI Voice" | "LinkedIn" | "Calendly";

export interface CreditMetric {
  id: string;
  label: string;
  used: number;
  total: number;
  unit?: string;
}

export interface MockUser {
  name: string;
  role: string;
  organisation: string;
  email: string;
  initials: string;
  plan: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: string;
  initials: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  kind: "campaign" | "screening" | "interview" | "usage" | "system";
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  status: Status;
  skills: string[];
  emailRevealed: boolean;
  phoneRevealed: boolean;
}

export interface ConversationPreviewItem {
  id: string;
  candidateName: string;
  channel: Channel;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: Extract<Status, "Connected" | "Disconnected">;
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  channel?: Channel;
}

export interface ScoreBreakdownItem {
  label: string;
  score: number;
  weight?: string;
}

/* ------------------------------------------------------------------ */
/* Placeholder table + chart primitives used by module preview pages.  */
/* ------------------------------------------------------------------ */

export type TableCell =
  | string
  | number
  | { kind: "status"; value: Status }
  | { kind: "channel"; value: Channel }
  | { kind: "score"; value: number };

export interface TableColumn {
  key: string;
  label: string;
  align?: "left" | "right";
}

export interface PlaceholderTable {
  columns: TableColumn[];
  rows: Record<string, TableCell>[];
}

export interface ChartPoint {
  label: string;
  primary: number;
  secondary?: number;
}

export interface PlaceholderChart {
  type: "area" | "bar";
  title: string;
  description?: string;
  series: { primary: string; secondary?: string };
  data: ChartPoint[];
}
