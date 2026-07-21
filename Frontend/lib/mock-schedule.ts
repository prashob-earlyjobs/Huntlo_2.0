import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Link2,
  RefreshCw,
  UserX,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Metrics                                                              */
/* ------------------------------------------------------------------ */

export interface ScheduleMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
  tooltip: string;
  icon: LucideIcon;
}

export const SCHEDULE_METRICS: ScheduleMetric[] = [
  {
    id: "today",
    label: "Interviews Today",
    value: "3",
    change: "+1",
    trend: "up",
    comparison: "vs yesterday",
    tooltip: "Confirmed interviews scheduled for today.",
    icon: CalendarDays,
  },
  {
    id: "upcoming",
    label: "Upcoming Interviews",
    value: "14",
    change: "+4",
    trend: "up",
    comparison: "vs last week",
    tooltip: "Scheduled interviews in the next 14 days.",
    icon: CalendarClock,
  },
  {
    id: "awaiting",
    label: "Awaiting Candidate Booking",
    value: "9",
    change: "-2",
    trend: "down",
    comparison: "vs last week",
    tooltip: "Links sent where the candidate has not picked a slot yet.",
    icon: Link2,
  },
  {
    id: "completed",
    label: "Completed This Week",
    value: "11",
    change: "+3",
    trend: "up",
    comparison: "vs last week",
    tooltip: "Interviews marked completed in the current week.",
    icon: CalendarCheck2,
  },
  {
    id: "rescheduled",
    label: "Rescheduled",
    value: "4",
    change: "+1",
    trend: "up",
    comparison: "vs last week",
    tooltip: "Interviews moved to a new time this week.",
    icon: RefreshCw,
  },
  {
    id: "noshow",
    label: "No Shows",
    value: "2",
    change: "-1",
    trend: "down",
    comparison: "vs last week",
    tooltip: "Candidates who did not join a confirmed interview.",
    icon: UserX,
  },
];

/* ------------------------------------------------------------------ */
/* Interview statuses & catalogues                                      */
/* ------------------------------------------------------------------ */

export const INTERVIEW_STATUSES = [
  "Draft",
  "Link Sent",
  "Awaiting Booking",
  "Scheduled",
  "Rescheduled",
  "Completed",
  "Cancelled",
  "No Show",
  "Expired",
] as const;

export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const INTERVIEW_TYPES = [
  "Intro call",
  "Technical screen",
  "Panel interview",
  "Hiring manager",
  "Founder chat",
  "Final round",
] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const MEETING_PLATFORMS = [
  "Google Meet",
  "Zoom",
  "Microsoft Teams",
  "In person",
  "Phone",
] as const;

export type MeetingPlatform = (typeof MEETING_PLATFORMS)[number];

export const BOOKING_SOURCES = [
  "Calendly",
  "Manual",
  "Candidate availability",
  "Huntlo 360",
  "Outreach campaign",
] as const;

export type BookingSource = (typeof BOOKING_SOURCES)[number];

export const REMINDER_STATUSES = [
  "Not sent",
  "24h sent",
  "2h sent",
  "Both sent",
  "Failed",
] as const;

export type ReminderStatus = (typeof REMINDER_STATUSES)[number];

export const SCHEDULING_METHODS = [
  "Calendly Link",
  "Manual Time Selection",
  "Request Candidate Availability",
] as const;

export type SchedulingMethod = (typeof SCHEDULING_METHODS)[number];

export const DURATION_OPTIONS = [
  "15 min",
  "30 min",
  "45 min",
  "60 min",
  "90 min",
] as const;

export const TIMEZONE_OPTIONS = [
  "Asia/Kolkata (IST)",
  "Candidate's local timezone",
  "America/New_York (ET)",
  "Europe/London (GMT)",
] as const;

export const REMINDER_CONFIGS = [
  "24h and 2h before",
  "24h before only",
  "2h before only",
  "No reminders",
] as const;

export const SCHEDULE_RECRUITERS = [
  "Ananya Sharma",
  "Neha Gupta",
  "Rohan Desai",
] as const;

export const SCHEDULE_INTERVIEWERS = [
  "Vikram Shah",
  "Meera Iyer",
  "Ananya Sharma",
  "Neha Gupta",
  "Kabir Malhotra",
  "Sana Qureshi",
] as const;

/* ------------------------------------------------------------------ */
/* Interviews                                                           */
/* ------------------------------------------------------------------ */

export interface Interview {
  id: string;
  candidateId: string | null;
  candidateName: string;
  candidateTitle: string;
  candidateCompany: string;
  jobId: string | null;
  jobTitle: string;
  interviewType: InterviewType;
  interviewers: string[];
  recruiter: string;
  /** ISO-like local display date for filtering / calendar, e.g. 2026-07-16 */
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
  duration: string;
  timezone: string;
  platform: MeetingPlatform;
  meetingLink: string | null;
  location: string | null;
  bookingSource: BookingSource;
  reminderStatus: ReminderStatus;
  status: InterviewStatus;
  round: string;
  instructions: string;
}

export const INTERVIEWS: Interview[] = [
  {
    id: "int-1",
    candidateId: "cand-1",
    candidateName: "Priya Nair",
    candidateTitle: "Senior Backend Engineer",
    candidateCompany: "Razorpay",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    interviewType: "Panel interview",
    interviewers: ["Vikram Shah", "Ananya Sharma"],
    recruiter: "Ananya Sharma",
    dateKey: "2026-07-16",
    dateLabel: "Today",
    timeLabel: "11:00 AM – 12:00 PM",
    duration: "60 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/huntlo-priya-panel",
    location: null,
    bookingSource: "Calendly",
    reminderStatus: "Both sent",
    status: "Scheduled",
    round: "Round 2 · Panel",
    instructions:
      "Focus on systems design and ownership. Priya has completed AI screening (92).",
  },
  {
    id: "int-2",
    candidateId: "cand-8",
    candidateName: "Rahul Venkatesh",
    candidateTitle: "Backend Engineer",
    candidateCompany: "Swiggy",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    interviewType: "Technical screen",
    interviewers: ["Kabir Malhotra"],
    recruiter: "Ananya Sharma",
    dateKey: "2026-07-16",
    dateLabel: "Today",
    timeLabel: "3:30 PM – 4:15 PM",
    duration: "45 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "Zoom",
    meetingLink: "https://zoom.us/j/huntlo-rahul",
    location: null,
    bookingSource: "Huntlo 360",
    reminderStatus: "2h sent",
    status: "Scheduled",
    round: "Round 1 · Technical",
    instructions: "Live coding on a distributed queue problem.",
  },
  {
    id: "int-3",
    candidateId: "cand-5",
    candidateName: "Ananya Krishnan",
    candidateTitle: "Data Engineer",
    candidateCompany: "Flipkart",
    jobId: "j3",
    jobTitle: "Data Engineer",
    interviewType: "Hiring manager",
    interviewers: ["Meera Iyer"],
    recruiter: "Neha Gupta",
    dateKey: "2026-07-16",
    dateLabel: "Today",
    timeLabel: "5:00 PM – 5:30 PM",
    duration: "30 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/huntlo-ananya-hm",
    location: null,
    bookingSource: "Manual",
    reminderStatus: "24h sent",
    status: "Scheduled",
    round: "Round 2 · HM",
    instructions: "Culture fit and team collaboration.",
  },
  {
    id: "int-4",
    candidateId: "cand-2",
    candidateName: "Karthik Iyer",
    candidateTitle: "Staff Engineer",
    candidateCompany: "PhonePe",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    interviewType: "Intro call",
    interviewers: ["Ananya Sharma"],
    recruiter: "Ananya Sharma",
    dateKey: "2026-07-17",
    dateLabel: "Tomorrow",
    timeLabel: "10:00 AM – 10:30 AM",
    duration: "30 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/huntlo-karthik-intro",
    location: null,
    bookingSource: "Outreach campaign",
    reminderStatus: "Not sent",
    status: "Scheduled",
    round: "Round 0 · Intro",
    instructions: "Light intro — confirm interest and notice period.",
  },
  {
    id: "int-5",
    candidateId: "cand-3",
    candidateName: "Sneha Kulkarni",
    candidateTitle: "Product Designer",
    candidateCompany: "CRED",
    jobId: "j2",
    jobTitle: "Product Designer",
    interviewType: "Panel interview",
    interviewers: ["Meera Iyer", "Sana Qureshi"],
    recruiter: "Rohan Desai",
    dateKey: "2026-07-18",
    dateLabel: "Fri, Jul 18",
    timeLabel: "2:00 PM – 3:00 PM",
    duration: "60 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "In person",
    meetingLink: null,
    location: "Bengaluru HQ · Room Indus",
    bookingSource: "Candidate availability",
    reminderStatus: "24h sent",
    status: "Rescheduled",
    round: "Round 2 · Design panel",
    instructions: "Portfolio walkthrough — moved from Jul 17 at candidate request.",
  },
  {
    id: "int-6",
    candidateId: "cand-7",
    candidateName: "Ishaan Mehta",
    candidateTitle: "Backend Engineer",
    candidateCompany: "Freshworks",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    interviewType: "Technical screen",
    interviewers: ["Kabir Malhotra"],
    recruiter: "Ananya Sharma",
    dateKey: "2026-07-14",
    dateLabel: "Mon, Jul 14",
    timeLabel: "11:00 AM – 11:45 AM",
    duration: "45 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "Zoom",
    meetingLink: "https://zoom.us/j/huntlo-ishaan",
    location: null,
    bookingSource: "Calendly",
    reminderStatus: "Both sent",
    status: "No Show",
    round: "Round 1 · Technical",
    instructions: "Candidate did not join — follow up before rebooking.",
  },
  {
    id: "int-7",
    candidateId: "cand-4",
    candidateName: "Divya Rao",
    candidateTitle: "Enterprise AE",
    candidateCompany: "Salesforce",
    jobId: "j5",
    jobTitle: "Enterprise Sales Manager",
    interviewType: "Founder chat",
    interviewers: ["Vikram Shah"],
    recruiter: "Neha Gupta",
    dateKey: "2026-07-15",
    dateLabel: "Tue, Jul 15",
    timeLabel: "4:00 PM – 4:30 PM",
    duration: "30 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/huntlo-divya",
    location: null,
    bookingSource: "Manual",
    reminderStatus: "Both sent",
    status: "Completed",
    round: "Final · Founder",
    instructions: "Strong close — discuss offer next.",
  },
  {
    id: "int-8",
    candidateId: "cand-10",
    candidateName: "Meera Iyer",
    candidateTitle: "Data Engineer",
    candidateCompany: "Amazon",
    jobId: "j3",
    jobTitle: "Data Engineer",
    interviewType: "Technical screen",
    interviewers: ["Meera Iyer"],
    recruiter: "Neha Gupta",
    dateKey: "2026-07-20",
    dateLabel: "Mon, Jul 20",
    timeLabel: "Link expires in 5 days",
    duration: "45 min",
    timezone: "Candidate's local timezone",
    platform: "Google Meet",
    meetingLink: null,
    location: null,
    bookingSource: "Calendly",
    reminderStatus: "Not sent",
    status: "Awaiting Booking",
    round: "Round 1 · Technical",
    instructions: "Calendly link sent after screening shortlist.",
  },
  {
    id: "int-9",
    candidateId: "cand-9",
    candidateName: "Nikhil Bose",
    candidateTitle: "Backend Engineer",
    candidateCompany: "Oracle",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    interviewType: "Intro call",
    interviewers: ["Ananya Sharma"],
    recruiter: "Ananya Sharma",
    dateKey: "2026-07-19",
    dateLabel: "Sat, Jul 19",
    timeLabel: "Link sent · not opened",
    duration: "30 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "Google Meet",
    meetingLink: null,
    location: null,
    bookingSource: "Outreach campaign",
    reminderStatus: "Not sent",
    status: "Link Sent",
    round: "Round 0 · Intro",
    instructions: "Awaiting candidate to open the booking link.",
  },
  {
    id: "int-10",
    candidateId: "cand-6",
    candidateName: "Vikram Bhat",
    candidateTitle: "Frontend Engineer",
    candidateCompany: "Zoho",
    jobId: "j7",
    jobTitle: "Staff Frontend Engineer",
    interviewType: "Hiring manager",
    interviewers: ["Sana Qureshi"],
    recruiter: "Rohan Desai",
    dateKey: "2026-07-13",
    dateLabel: "Sun, Jul 13",
    timeLabel: "Cancelled",
    duration: "45 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "Microsoft Teams",
    meetingLink: null,
    location: null,
    bookingSource: "Manual",
    reminderStatus: "Failed",
    status: "Cancelled",
    round: "Round 2 · HM",
    instructions: "Cancelled by candidate — role no longer of interest.",
  },
  {
    id: "int-11",
    candidateId: "cand-1",
    candidateName: "Priya Nair",
    candidateTitle: "Senior Backend Engineer",
    candidateCompany: "Razorpay",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    interviewType: "Final round",
    interviewers: ["Vikram Shah", "Meera Iyer"],
    recruiter: "Ananya Sharma",
    dateKey: "2026-07-22",
    dateLabel: "Wed, Jul 22",
    timeLabel: "11:00 AM – 12:00 PM",
    duration: "60 min",
    timezone: "Asia/Kolkata (IST)",
    platform: "In person",
    meetingLink: null,
    location: "Bengaluru HQ · Boardroom",
    bookingSource: "Manual",
    reminderStatus: "Not sent",
    status: "Scheduled",
    round: "Round 3 · Final",
    instructions: "Offer discussion contingent on panel feedback.",
  },
  {
    id: "int-12",
    candidateId: "cand-8",
    candidateName: "Rahul Venkatesh",
    candidateTitle: "Backend Engineer",
    candidateCompany: "Swiggy",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    interviewType: "Hiring manager",
    interviewers: ["Vikram Shah"],
    recruiter: "Ananya Sharma",
    dateKey: "2026-07-21",
    dateLabel: "Tue, Jul 21",
    timeLabel: "Awaiting availability reply",
    duration: "30 min",
    timezone: "Candidate's local timezone",
    platform: "Google Meet",
    meetingLink: null,
    location: null,
    bookingSource: "Candidate availability",
    reminderStatus: "Not sent",
    status: "Awaiting Booking",
    round: "Round 2 · HM",
    instructions: "Requested three preferred slots from the candidate.",
  },
];

export function getInterview(id: string): Interview | undefined {
  return INTERVIEWS.find((interview) => interview.id === id);
}

/* ------------------------------------------------------------------ */
/* Detail extras                                                        */
/* ------------------------------------------------------------------ */

export interface ReminderHistoryEntry {
  id: string;
  channel: "Email" | "WhatsApp" | "SMS";
  label: string;
  status: "Sent" | "Failed" | "Scheduled";
  time: string;
}

export interface ScheduleActivityEntry {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
}

export interface InterviewNote {
  id: string;
  author: string;
  text: string;
  time: string;
}

export const INTERVIEW_REMINDERS: Record<string, ReminderHistoryEntry[]> = {
  "int-1": [
    {
      id: "r1",
      channel: "Email",
      label: "24h reminder",
      status: "Sent",
      time: "Jul 15, 11:00 AM",
    },
    {
      id: "r2",
      channel: "WhatsApp",
      label: "2h reminder",
      status: "Sent",
      time: "Today, 9:00 AM",
    },
  ],
  "int-2": [
    {
      id: "r3",
      channel: "Email",
      label: "2h reminder",
      status: "Sent",
      time: "Today, 1:30 PM",
    },
  ],
};

export const INTERVIEW_ACTIVITY: Record<string, ScheduleActivityEntry[]> = {
  "int-1": [
    {
      id: "a1",
      icon: CalendarCheck2,
      title: "Candidate booked via Calendly",
      detail: "Priya picked Thu 11:00 AM IST · Panel interview",
      time: "Jul 12, 4:22 PM",
    },
    {
      id: "a2",
      icon: Link2,
      title: "Scheduling link sent",
      detail: "Email + WhatsApp · expires in 7 days",
      time: "Jul 12, 10:05 AM",
    },
    {
      id: "a3",
      icon: CalendarClock,
      title: "Interview created",
      detail: "By Ananya Sharma after screening shortlist",
      time: "Jul 12, 9:58 AM",
    },
  ],
};

export const INTERVIEW_NOTES: Record<string, InterviewNote[]> = {
  "int-1": [
    {
      id: "n1",
      author: "Ananya Sharma",
      text: "Priya asked about on-call rotation — share the SRE pairing model in the panel intro.",
      time: "Yesterday, 6:10 PM",
    },
  ],
};

export function getReminders(id: string): ReminderHistoryEntry[] {
  return (
    INTERVIEW_REMINDERS[id] ?? [
      {
        id: "rx",
        channel: "Email",
        label: "No reminders yet",
        status: "Scheduled",
        time: "—",
      },
    ]
  );
}

export function getActivity(id: string): ScheduleActivityEntry[] {
  return (
    INTERVIEW_ACTIVITY[id] ?? [
      {
        id: "ax",
        icon: CalendarClock,
        title: "Interview created",
        detail: "Awaiting further scheduling activity",
        time: "—",
      },
    ]
  );
}

export function getNotes(id: string): InterviewNote[] {
  return INTERVIEW_NOTES[id] ?? [];
}

/* ------------------------------------------------------------------ */
/* Schedule flow — candidate / job pickers                              */
/* ------------------------------------------------------------------ */

export const SCHEDULE_CANDIDATES = [
  {
    id: "cand-1",
    name: "Priya Nair",
    title: "Senior Backend Engineer",
    company: "Razorpay",
  },
  {
    id: "cand-8",
    name: "Rahul Venkatesh",
    title: "Backend Engineer",
    company: "Swiggy",
  },
  {
    id: "cand-5",
    name: "Ananya Krishnan",
    title: "Data Engineer",
    company: "Flipkart",
  },
  {
    id: "cand-2",
    name: "Karthik Iyer",
    title: "Staff Engineer",
    company: "PhonePe",
  },
  {
    id: "cand-3",
    name: "Sneha Kulkarni",
    title: "Product Designer",
    company: "CRED",
  },
] as const;

export const CALENDLY_EVENT_TYPES = [
  "Intro call · 30 min",
  "Technical screen · 45 min",
  "Panel interview · 60 min",
  "Founder chat · 20 min",
] as const;

export const MANUAL_SLOTS = [
  "Today, 4:00 PM",
  "Tomorrow, 10:00 AM",
  "Tomorrow, 2:30 PM",
  "Fri, Jul 18 · 11:00 AM",
  "Mon, Jul 20 · 3:00 PM",
] as const;

/* ------------------------------------------------------------------ */
/* Availability                                                         */
/* ------------------------------------------------------------------ */

export const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export interface WeeklyHourSlot {
  day: (typeof WEEKDAY_LABELS)[number];
  enabled: boolean;
  start: string;
  end: string;
}

export const DEFAULT_WEEKLY_HOURS: WeeklyHourSlot[] = [
  { day: "Monday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Tuesday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Wednesday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Thursday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Friday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Saturday", enabled: false, start: "10:00", end: "14:00" },
  { day: "Sunday", enabled: false, start: "10:00", end: "14:00" },
];

export interface DateOverride {
  id: string;
  date: string;
  label: string;
  available: boolean;
  hours?: string;
}

export const DATE_OVERRIDES: DateOverride[] = [
  {
    id: "o1",
    date: "2026-07-17",
    label: "Thu, Jul 17",
    available: true,
    hours: "10:00 – 14:00 only",
  },
  {
    id: "o2",
    date: "2026-07-23",
    label: "Thu, Jul 23",
    available: false,
  },
  {
    id: "o3",
    date: "2026-08-15",
    label: "Sat, Aug 15 · Independence Day",
    available: false,
  },
];

export const UNAVAILABLE_DATES = [
  { id: "u1", date: "2026-07-23", label: "Thu, Jul 23 · Team offsite" },
  { id: "u2", date: "2026-08-15", label: "Sat, Aug 15 · Public holiday" },
  { id: "u3", date: "2026-08-19", label: "Wed, Aug 19 · PTO" },
];

export const AVAILABILITY_DEFAULTS = {
  bufferBefore: "15 min",
  bufferAfter: "10 min",
  minNotice: "24 hours",
  maxWindow: "14 days",
  dailyLimit: "5",
  timezone: "Asia/Kolkata (IST)",
};

/* ------------------------------------------------------------------ */
/* Calendar helpers — anchored to Jul 2026                              */
/* ------------------------------------------------------------------ */

/** Anchor "today" for the mock calendar UI. */
export const CALENDAR_TODAY = "2026-07-16";

export function interviewsOnDate(dateKey: string): Interview[] {
  return INTERVIEWS.filter(
    (interview) =>
      interview.dateKey === dateKey &&
      interview.status !== "Cancelled" &&
      interview.status !== "Link Sent"
  );
}

export function monthGrid(year: number, month: number): (string | null)[] {
  // month is 0-indexed
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push(key);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function weekDates(anchorKey: string): string[] {
  const [y, m, d] = anchorKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(date);
    next.setDate(date.getDate() + index);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
  });
}

export function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
