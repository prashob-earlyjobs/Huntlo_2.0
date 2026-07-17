import { apiClient } from "./client";
import type { Interview } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export type AvailabilityRule = {
  userId: string;
  organizationId: string;
  timezone: string;
  weeklyHours: Array<{
    day: string;
    enabled: boolean;
    start: string;
    end: string;
  }>;
  dateOverrides: Array<{
    date: string;
    enabled: boolean;
    start?: string | null;
    end?: string | null;
    label?: string | null;
  }>;
  unavailableDates: string[];
  bufferBefore: number;
  bufferAfter: number;
  minimumNotice: number;
  maximumBookingWindow: number;
  dailyLimit: number;
};

export type CalendlyEventType = {
  name: string;
  schedulingUrl: string;
  uri: string;
  duration?: number;
};

export type ScheduleInterviewInput = {
  candidateId?: string | null;
  jobId?: string | null;
  interviewType?: string;
  round?: string | null;
  interviewerIds?: string[];
  schedulingMethod?: "calendly_link" | "manual" | "candidate_availability";
  providerEventTypeId?: string | null;
  schedulingUrl?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  timezone?: string;
  location?: string | null;
  meetingUrl?: string | null;
  instructions?: string | null;
  inviteChannel?: "email" | "whatsapp" | null;
  inviteeEmail?: string | null;
  sendLink?: boolean;
  linkExpiryHours?: number;
};

export interface SchedulingApi {
  listInterviews(params?: ApiQueryParams): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | null>;
  scheduleInterview(body: ScheduleInterviewInput): Promise<Interview>;
  updateInterview(id: string, body: Partial<ScheduleInterviewInput>): Promise<Interview>;
  sendLink(id: string, body?: { channel?: "email" | "whatsapp"; message?: string | null }): Promise<Interview>;
  reschedule(id: string, body: { startAt: string; endAt?: string; timezone?: string }): Promise<Interview>;
  cancel(id: string): Promise<Interview>;
  remind(id: string): Promise<Interview>;
  complete(id: string): Promise<Interview>;
  noShow(id: string): Promise<Interview>;
  calendar(params?: ApiQueryParams): Promise<{ from: string; to: string; items: Interview[] }>;
  getAvailability(): Promise<AvailabilityRule>;
  putAvailability(body: Partial<AvailabilityRule>): Promise<AvailabilityRule>;
  listEventTypes(): Promise<CalendlyEventType[]>;
  syncBookings(body?: { eventTypeUri?: string; minStartTime?: string }): Promise<{ synced: number; message: string }>;
}

function mapInterview(row: Record<string, unknown>): Interview {
  return {
    id: String(row.id),
    candidateId: (row.candidateId as string | null) ?? null,
    candidateName: String(row.candidateName || "Candidate"),
    candidateTitle: String(row.candidateTitle || ""),
    candidateCompany: String(row.candidateCompany || ""),
    jobId: (row.jobId as string | null) ?? null,
    jobTitle: String(row.jobTitle || ""),
    interviewType: (row.interviewType as Interview["interviewType"]) || "Intro call",
    interviewers: (row.interviewers as string[]) || (row.interviewerIds as string[]) || [],
    recruiter: String(row.recruiter || "Unknown"),
    dateKey: String(row.dateKey || ""),
    dateLabel: String(row.dateLabel || ""),
    timeLabel: String(row.timeLabel || ""),
    duration: String(row.duration || "—"),
    timezone: String(row.timezone || "Asia/Kolkata"),
    platform: (row.platform as Interview["platform"]) || "Google Meet",
    meetingLink: String(row.meetingLink || row.meetingUrl || ""),
    location: String(row.location || ""),
    bookingSource: (row.bookingSource as Interview["bookingSource"]) || "Calendly",
    reminderStatus: (row.reminderStatus as Interview["reminderStatus"]) || "Not sent",
    status: (row.status as Interview["status"]) || "Awaiting Booking",
    round: String(row.round || ""),
    instructions: String(row.instructions || ""),
  };
}

const mockSchedulingApi: SchedulingApi = {
  async listInterviews() {
    await simulateMockLatency();
    const { INTERVIEWS } = await import("@/lib/mock-schedule");
    return INTERVIEWS;
  },
  async getInterview(id) {
    await simulateMockLatency();
    const { getInterview } = await import("@/lib/mock-schedule");
    return getInterview(id) ?? null;
  },
  async scheduleInterview(body) {
    await simulateMockLatency();
    const { INTERVIEWS } = await import("@/lib/mock-schedule");
    return { ...INTERVIEWS[0]!, ...body } as Interview;
  },
  async updateInterview(id, body) {
    const current = await this.getInterview(id);
    return { ...(current || (await this.listInterviews())[0]!), ...body } as Interview;
  },
  async sendLink(id) {
    return (await this.getInterview(id))!;
  },
  async reschedule(id) {
    return (await this.getInterview(id))!;
  },
  async cancel(id) {
    const row = await this.getInterview(id);
    return { ...row!, status: "Cancelled" };
  },
  async remind(id) {
    return (await this.getInterview(id))!;
  },
  async complete(id) {
    const row = await this.getInterview(id);
    return { ...row!, status: "Completed" };
  },
  async noShow(id) {
    const row = await this.getInterview(id);
    return { ...row!, status: "No Show" };
  },
  async calendar() {
    const items = await this.listInterviews();
    return { from: new Date().toISOString(), to: new Date().toISOString(), items };
  },
  async getAvailability() {
    await simulateMockLatency();
    const { AVAILABILITY_DEFAULTS, DEFAULT_WEEKLY_HOURS } = await import(
      "@/lib/mock-schedule"
    );
    const parseNum = (value: string, fallback: number) => {
      const match = String(value).match(/\d+/);
      return match ? Number(match[0]) : fallback;
    };
    return {
      userId: "me",
      organizationId: "org",
      timezone: AVAILABILITY_DEFAULTS.timezone.split(" ")[0] || "Asia/Kolkata",
      weeklyHours: DEFAULT_WEEKLY_HOURS,
      dateOverrides: [],
      unavailableDates: [],
      bufferBefore: parseNum(AVAILABILITY_DEFAULTS.bufferBefore, 15),
      bufferAfter: parseNum(AVAILABILITY_DEFAULTS.bufferAfter, 15),
      minimumNotice: parseNum(AVAILABILITY_DEFAULTS.minNotice, 24),
      maximumBookingWindow: parseNum(AVAILABILITY_DEFAULTS.maxWindow, 14),
      dailyLimit: parseNum(AVAILABILITY_DEFAULTS.dailyLimit, 6),
    };
  },
  async putAvailability(body) {
    const current = await this.getAvailability();
    return { ...current, ...body };
  },
  async listEventTypes() {
    await simulateMockLatency();
    return [
      {
        name: "Intro call",
        schedulingUrl: "https://calendly.com/huntlo/intro",
        uri: "https://api.calendly.com/event_types/demo",
        duration: 30,
      },
    ];
  },
  async syncBookings() {
    return { synced: 0, message: "Synced 0 Calendly booking(s)." };
  },
};

const liveSchedulingApi: SchedulingApi = {
  async listInterviews(params) {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/interviews${buildQueryString(params)}`
    );
    return result.data.map(mapInterview);
  },
  async getInterview(id) {
    try {
      const result = await apiClient.get<Record<string, unknown>>(`/interviews/${id}`);
      return mapInterview(result.data);
    } catch {
      return null;
    }
  },
  async scheduleInterview(body) {
    const result = await apiClient.post<Record<string, unknown>>("/interviews", body, {
      sensitive: true,
    });
    return mapInterview(result.data);
  },
  async updateInterview(id, body) {
    const result = await apiClient.patch<Record<string, unknown>>(`/interviews/${id}`, body, {
      sensitive: true,
    });
    return mapInterview(result.data);
  },
  async sendLink(id, body) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/interviews/${id}/send-link`,
      body ?? {},
      { sensitive: true }
    );
    return mapInterview(result.data);
  },
  async reschedule(id, body) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/interviews/${id}/reschedule`,
      body,
      { sensitive: true }
    );
    return mapInterview(result.data);
  },
  async cancel(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/interviews/${id}/cancel`,
      {},
      { sensitive: true }
    );
    return mapInterview(result.data);
  },
  async remind(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/interviews/${id}/remind`,
      {},
      { sensitive: true }
    );
    return mapInterview(result.data);
  },
  async complete(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/interviews/${id}/complete`,
      {},
      { sensitive: true }
    );
    return mapInterview(result.data);
  },
  async noShow(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/interviews/${id}/no-show`,
      {},
      { sensitive: true }
    );
    return mapInterview(result.data);
  },
  async calendar(params) {
    const result = await apiClient.get<{
      from: string;
      to: string;
      items: Record<string, unknown>[];
    }>(`/interviews/calendar${buildQueryString(params)}`);
    return {
      from: result.data.from,
      to: result.data.to,
      items: result.data.items.map(mapInterview),
    };
  },
  async getAvailability() {
    const result = await apiClient.get<AvailabilityRule>("/availability");
    return result.data;
  },
  async putAvailability(body) {
    const result = await apiClient.put<AvailabilityRule>("/availability", body, {
      sensitive: true,
    });
    return result.data;
  },
  async listEventTypes() {
    const result = await apiClient.get<CalendlyEventType[]>("/scheduling/event-types");
    return result.data;
  },
  async syncBookings(body) {
    const result = await apiClient.post<{ synced: number; message: string }>(
      "/scheduling/sync",
      body ?? {},
      { sensitive: true }
    );
    return result.data;
  },
};

export const schedulingApi = createDomainService({
  mock: mockSchedulingApi,
  live: liveSchedulingApi,
});
