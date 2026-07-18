import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import type { TeamMember } from "./contracts";

export type TeamRoleKey =
  | "owner"
  | "admin"
  | "recruiter"
  | "hiring_manager"
  | "interviewer"
  | "analyst";

export type ApiTeamMember = {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  role: TeamRoleKey | string;
  roleLabel: string;
  permissions: string[];
  assignedJobIds: string[];
  managerId: string | null;
  status: string;
  joinedAt: string | null;
  lastLoginAt: string | null;
};

export type TeamInvitation = {
  id: string;
  email: string;
  role: string;
  roleLabel: string;
  status: string;
  expiresAt: string;
  token?: string;
};

export type TeamMetrics = {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  seatsAvailable: number | null;
  seatLimit: number | null;
  plan: string;
};

export type TeamOverview = {
  members: ApiTeamMember[];
  invitations: TeamInvitation[];
  metrics: TeamMetrics;
  permissionMatrix: Record<string, Record<string, string[]>>;
  roles: Array<{ id: string; key: string; name: string; isSystem: boolean; permissions: string[] }>;
};

export type OrganizationProfile = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  country: string | null;
  timezone: string;
  currency: string;
  logo: string | null;
  ownerUserId: string | null;
  status: string;
  plan: string;
  initials: string;
  seatLimit: number;
  occupiedSeats: number;
  seatsAvailable: number | null;
  settings?: Record<string, unknown>;
};

export type UpdateOrganizationInput = {
  name?: string;
  website?: string | null;
  industry?: string | null;
  companySize?: string | null;
  country?: string | null;
  timezone?: string;
  currency?: string;
  logo?: string | null;
  settings?: Record<string, unknown>;
};

export type CreateInvitationInput = {
  email: string;
  name?: string;
  role?: TeamRoleKey | string;
  permissions?: string[];
  assignedJobIds?: string[];
};

export type CreateTeamAccountResult = {
  member: ApiTeamMember;
  credentials: {
    email: string;
    temporaryPassword: string;
  };
};

export type CustomRole = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
};

const ROLE_LABEL_TO_KEY: Record<string, TeamRoleKey> = {
  "Workspace Owner": "owner",
  Admin: "admin",
  Recruiter: "recruiter",
  "Hiring Manager": "hiring_manager",
  Interviewer: "interviewer",
  Analyst: "analyst",
};

export function toRoleKey(role: string): TeamRoleKey | string {
  return ROLE_LABEL_TO_KEY[role] ?? role;
}

export function mapApiMemberToUi(member: ApiTeamMember): TeamMember {
  const statusMap: Record<string, TeamMember["status"]> = {
    active: "Active",
    invited: "Invited",
    suspended: "Suspended",
    deactivated: "Deactivated",
  };

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: (member.roleLabel as TeamMember["role"]) || "Recruiter",
    manager: "—",
    phone: member.phone ?? "",
    title: member.title ?? "",
    assignedJobs: [],
    candidatesSourced: 0,
    campaigns: 0,
    lastActive: member.lastLoginAt
      ? new Date(member.lastLoginAt).toLocaleString()
      : "—",
    lastLogin: member.lastLoginAt
      ? new Date(member.lastLoginAt).toLocaleString()
      : "—",
    status: statusMap[member.status] ?? "Active",
    moduleAccess: [],
    usage: { searches: 0, reveals: 0, outreach: 0, screenings: 0 },
    activity: [],
  };
}

export interface OrganizationApi {
  get(): Promise<OrganizationProfile>;
  update(input: UpdateOrganizationInput): Promise<OrganizationProfile>;
}

export interface TeamApi {
  getOverview(): Promise<TeamOverview>;
  listMembers(): Promise<ApiTeamMember[]>;
  createAccount(input: CreateInvitationInput & { name: string }): Promise<CreateTeamAccountResult>;
  /** @deprecated Prefer createInvitation */
  inviteMember(organizationId: string, email: string): Promise<void>;
  createInvitation(input: CreateInvitationInput): Promise<{ invitation: TeamInvitation; token: string }>;
  resendInvitation(id: string): Promise<{ invitation: TeamInvitation; token: string }>;
  revokeInvitation(id: string): Promise<void>;
  getMember(id: string): Promise<ApiTeamMember>;
  updateMember(id: string, input: Record<string, unknown>): Promise<ApiTeamMember>;
  updateMemberRole(id: string, role: string): Promise<ApiTeamMember>;
  updateMemberPermissions(id: string, permissions: string[]): Promise<ApiTeamMember>;
  updateMemberStatus(id: string, status: string): Promise<ApiTeamMember>;
  removeMember(id: string): Promise<void>;
  listRoles(): Promise<{ roles: CustomRole[]; matrix: TeamOverview["permissionMatrix"] }>;
  createRole(input: { name: string; description?: string; permissions: string[] }): Promise<CustomRole>;
  updateRole(id: string, input: Partial<CustomRole>): Promise<CustomRole>;
  deleteRole(id: string): Promise<void>;
}

const mockOrganizationApi: OrganizationApi = {
  async get() {
    await simulateMockLatency();
    const { ORGANISATION } = await import("@/lib/mock-team");
    return {
      id: "org-1",
      name: ORGANISATION.name,
      slug: "earlyjobs",
      website: ORGANISATION.website,
      industry: ORGANISATION.industry,
      companySize: ORGANISATION.companySize,
      country: ORGANISATION.country,
      timezone: ORGANISATION.timezone,
      currency: "INR",
      logo: null,
      ownerUserId: "user-1",
      status: "active",
      plan: "Growth",
      initials: ORGANISATION.logoInitials,
      seatLimit: 15,
      occupiedSeats: 12,
      seatsAvailable: 3,
    };
  },
  async update(input) {
    const current = await mockOrganizationApi.get();
    return { ...current, ...input };
  },
};

const liveOrganizationApi: OrganizationApi = {
  async get() {
    const result = await apiClient.get<OrganizationProfile>("/organization");
    return result.data;
  },
  async update(input) {
    const result = await apiClient.patch<OrganizationProfile>("/organization", input, {
      sensitive: true,
    });
    return result.data;
  },
};

const mockTeamApi: TeamApi = {
  async getOverview() {
    await simulateMockLatency();
    const { TEAM_MEMBERS, PERMISSION_MATRIX } = await import("@/lib/mock-team");
    return {
      members: TEAM_MEMBERS.map((member) => ({
        id: member.id,
        organizationId: "org-1",
        userId: member.id,
        name: member.name,
        firstName: member.name.split(" ")[0] ?? "",
        lastName: member.name.split(" ").slice(1).join(" "),
        email: member.email,
        phone: member.phone,
        title: member.title,
        role: toRoleKey(member.role),
        roleLabel: member.role,
        permissions: [],
        assignedJobIds: [],
        managerId: null,
        status: member.status.toLowerCase(),
        joinedAt: null,
        lastLoginAt: null,
      })),
      invitations: [],
      metrics: {
        totalMembers: TEAM_MEMBERS.length,
        activeMembers: TEAM_MEMBERS.filter((m) => m.status === "Active").length,
        pendingInvitations: TEAM_MEMBERS.filter((m) => m.status === "Invited").length,
        seatsAvailable: 3,
        seatLimit: 15,
        plan: "Growth",
      },
      permissionMatrix: Object.fromEntries(
        Object.entries(PERMISSION_MATRIX).map(([role, modules]) => [
          toRoleKey(role),
          Object.fromEntries(
            Object.entries(modules).map(([module, actions]) => [
              module,
              actions.map((action) => action.toLowerCase()),
            ])
          ),
        ])
      ),
      roles: [],
    };
  },
  async listMembers() {
    const overview = await this.getOverview();
    return overview.members;
  },
  async inviteMember(_organizationId, email) {
    await this.createInvitation({ email, role: "recruiter" });
  },
  async createAccount(input) {
    await simulateMockLatency();
    const role = input.role ?? "recruiter";
    return {
      member: {
        id: `member-${Date.now()}`,
        organizationId: "org-1",
        userId: `user-${Date.now()}`,
        name: input.name,
        firstName: input.name.split(" ")[0] ?? input.name,
        lastName: input.name.split(" ").slice(1).join(" ") || "Member",
        email: input.email,
        phone: null,
        title: null,
        role,
        roleLabel: role,
        permissions: input.permissions ?? [],
        assignedJobIds: input.assignedJobIds ?? [],
        managerId: null,
        status: "active",
        joinedAt: new Date().toISOString(),
        lastLoginAt: null,
      },
      credentials: {
        email: input.email,
        temporaryPassword: "HtMockPassword7",
      },
    };
  },
  async createInvitation(input) {
    await simulateMockLatency();
    return {
      invitation: {
        id: `inv-${Date.now()}`,
        email: input.email,
        role: input.role ?? "recruiter",
        roleLabel: input.role ?? "Recruiter",
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
      token: "mock-invite-token",
    };
  },
  async resendInvitation(id) {
    await simulateMockLatency();
    return {
      invitation: {
        id,
        email: "member@example.com",
        role: "recruiter",
        roleLabel: "Recruiter",
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
      token: "mock-invite-token",
    };
  },
  async revokeInvitation() {
    await simulateMockLatency();
  },
  async getMember(id) {
    const members = await this.listMembers();
    const member = members.find((item) => item.id === id);
    if (!member) throw new Error("Member not found");
    return member;
  },
  async updateMember(id) {
    return this.getMember(id);
  },
  async updateMemberRole(id) {
    return this.getMember(id);
  },
  async updateMemberPermissions(id) {
    return this.getMember(id);
  },
  async updateMemberStatus(id) {
    return this.getMember(id);
  },
  async removeMember() {
    await simulateMockLatency();
  },
  async listRoles() {
    const overview = await this.getOverview();
    return { roles: overview.roles, matrix: overview.permissionMatrix };
  },
  async createRole(input) {
    await simulateMockLatency();
    return {
      id: `role-${Date.now()}`,
      key: `role-${Date.now()}`,
      name: input.name,
      description: input.description,
      permissions: input.permissions,
      isSystem: false,
    };
  },
  async updateRole(id, input) {
    return {
      id,
      key: id,
      name: input.name ?? "Custom role",
      description: input.description,
      permissions: input.permissions ?? [],
      isSystem: false,
    };
  },
  async deleteRole() {
    await simulateMockLatency();
  },
};

const liveTeamApi: TeamApi = {
  async getOverview() {
    const result = await apiClient.get<TeamOverview>("/team");
    return result.data;
  },
  async listMembers() {
    const overview = await this.getOverview();
    return overview.members;
  },
  async inviteMember(_organizationId, email) {
    await this.createInvitation({ email, role: "recruiter" });
  },
  async createAccount(input) {
    const result = await apiClient.post<CreateTeamAccountResult>(
      "/team/members",
      input,
      { sensitive: true }
    );
    return result.data;
  },
  async createInvitation(input) {
    const result = await apiClient.post<{ invitation: TeamInvitation; token: string }>(
      "/team/invitations",
      input,
      { sensitive: true }
    );
    return result.data;
  },
  async resendInvitation(id) {
    const result = await apiClient.post<{ invitation: TeamInvitation; token: string }>(
      `/team/invitations/${id}/resend`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async revokeInvitation(id) {
    await apiClient.delete(`/team/invitations/${id}`, { sensitive: true });
  },
  async getMember(id) {
    const result = await apiClient.get<ApiTeamMember>(`/team/members/${id}`);
    return result.data;
  },
  async updateMember(id, input) {
    const result = await apiClient.patch<ApiTeamMember>(`/team/members/${id}`, input, {
      sensitive: true,
    });
    return result.data;
  },
  async updateMemberRole(id, role) {
    const result = await apiClient.patch<ApiTeamMember>(
      `/team/members/${id}/role`,
      { role },
      { sensitive: true }
    );
    return result.data;
  },
  async updateMemberPermissions(id, permissions) {
    const result = await apiClient.patch<ApiTeamMember>(
      `/team/members/${id}/permissions`,
      { permissions },
      { sensitive: true }
    );
    return result.data;
  },
  async updateMemberStatus(id, status) {
    const result = await apiClient.patch<ApiTeamMember>(
      `/team/members/${id}/status`,
      { status },
      { sensitive: true }
    );
    return result.data;
  },
  async removeMember(id) {
    await apiClient.delete(`/team/members/${id}`, { sensitive: true });
  },
  async listRoles() {
    const result = await apiClient.get<{
      roles: CustomRole[];
      matrix: TeamOverview["permissionMatrix"];
    }>("/roles");
    return result.data;
  },
  async createRole(input) {
    const result = await apiClient.post<CustomRole>("/roles", input, { sensitive: true });
    return result.data;
  },
  async updateRole(id, input) {
    const result = await apiClient.patch<CustomRole>(`/roles/${id}`, input, { sensitive: true });
    return result.data;
  },
  async deleteRole(id) {
    await apiClient.delete(`/roles/${id}`, { sensitive: true });
  },
};

export const organizationApi = createDomainService({
  mock: mockOrganizationApi,
  live: liveOrganizationApi,
});

export const teamApi = createDomainService({
  mock: mockTeamApi,
  live: liveTeamApi,
});
