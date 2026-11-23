import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { AgentsBreadcrumb } from "@/components/landing/agents/AgentsBreadcrumb";
import { AgentsShell } from "@/components/landing/agents/AgentsShell";
import {
  agentsContentWidth,
  agentsPrimaryCtaClass,
  agentsSecondaryCtaClass,
} from "@/components/landing/agents/agentsTokens";
import {
  AGENTS_HUB_CAPABILITY_STATUS,
  AGENTS_HUB_PATH,
  PILLAR_AGENTS,
} from "@/lib/agents/agentsHub";
import { AI_SCREENING_AGENT_WORKFLOW_PATH } from "@/lib/agents/aiScreeningAgentWorkflow";
import { EMPLOYEE_PULSE_SURVEYS_PATH } from "@/lib/agents/employeePulseSurveys";
import { INTERVIEW_SCHEDULING_AGENT_PATH } from "@/lib/agents/interviewSchedulingAgent";
import { JOINING_CONFIRMATION_PATH } from "@/lib/agents/joiningConfirmation";
import { NEW_HIRE_CHECK_IN_SURVEYS_PATH } from "@/lib/agents/newHireCheckInSurveys";
import { ONBOARDING_DOCUMENT_READINESS_PATH } from "@/lib/agents/onboardingDocumentReadiness";
import { PRE_JOINING_ENGAGEMENT_PATH } from "@/lib/agents/preJoiningEngagement";

export function AgentsHubPage() {
  return (
    <AgentsShell
      aiAskTopic="Huntlo AI Agents"
      aiAskPrompt={`What AI voice workflow agents does Huntlo describe on ${AGENTS_HUB_PATH} (https://www.huntlo.ai${AGENTS_HUB_PATH})?`}
    >
      <section className="relative overflow-hidden border-b border-border bg-secondary">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-accent blur-[120px]" />
        </div>
        <div className={`relative ${agentsContentWidth} py-16 md:py-24`}>
          <AgentsBreadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "AI Agents", href: AGENTS_HUB_PATH },
            ]}
          />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            AI Voice Workflows · Capability {AGENTS_HUB_CAPABILITY_STATUS}
          </p>
          <h1 className="mt-5 max-w-3xl text-[2rem] font-bold leading-[1.12] tracking-tight text-foreground sm:text-[2.35rem] md:text-[2.9rem]">
            AI Agents that organise conversations into reviewable actions
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Huntlo AI voice workflows help teams contact the right people, capture structured
            answers and hand results to an accountable owner — without inventing certainty or
            replacing human decisions.
          </p>
          <div className="relative z-10 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={AI_SCREENING_AGENT_WORKFLOW_PATH} className={agentsPrimaryCtaClass}>
              Explore AI Screening Agent
            </Link>
            <BookDemoLink className={agentsSecondaryCtaClass}>Book a Demo</BookDemoLink>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className={`${agentsContentWidth} py-16 md:py-20`}>
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Pillar agents
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Five workflow directions. Capability status must be product-approved before public
            Live/Pilot claims or indexation.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLAR_AGENTS.map((agent) => (
              <li key={agent.id}>
                <Link
                  href={agent.href}
                  className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
                    {agent.status}
                  </span>
                  <span className="mt-2 text-lg font-semibold text-foreground">{agent.name}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {agent.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground">
            Illustrative product directory — confirm availability before publication. No customer
            logos, performance numbers or unverified integrations are implied.
          </p>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Screening use cases
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Purpose-specific screening workflows share the transcript-and-rubric pattern with
            distinct intents. Capability status remains planned until product approval.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            <li>
              <Link
                href="/agents/high-volume-candidate-screening"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  High-Volume Candidate Screening
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Large applicant queues with campaign triage and recruiter review.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/bpo-voice-screening"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">BPO Voice Screening</span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Contact-centre hiring for shift expectations and communication requirements.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/frontline-candidate-screening"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Frontline Candidate Screening
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Logistics, retail and warehouse roles with site and shift criteria.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/staffing-agency-screening"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Staffing Agency Screening
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Multi-client staffing with client-specific rubrics and recruiter handoff.
                </span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Hiring & interview workflows
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Interview journey and action-queue patterns for coordination and structured
            first rounds. Capability status remains planned until product approval.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            <li>
              <Link
                href="/agents/ai-hiring-agent"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">AI Hiring Agent</span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Recruitment coordination with stage status and interviewer review.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/ai-voice-interviews"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">AI Voice Interviews</span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Structured first-round interviews with comparable, reviewable answers.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={INTERVIEW_SCHEDULING_AGENT_PATH}
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Interview Scheduling Agent
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Availability capture, reminders and reviewable scheduling handoffs.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/high-volume-hiring-workflows"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  High-Volume Hiring Workflows
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Bulk recruitment campaigns with stage status and recruiter review.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/recruitment-agency-hiring-agent"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Recruitment Agency Hiring Agent
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Candidate and client feedback coordination for agency operations.
                </span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Onboarding & joining workflows
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Offer-to-day-one timeline patterns for readiness, joining intent and frontline
            instructions. Capability status remains planned until product approval.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            <li>
              <Link
                href="/agents/ai-onboarding-agent"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  AI Onboarding Agent
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Offer-to-joining readiness with reviewable HR exception handoffs.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={PRE_JOINING_ENGAGEMENT_PATH}
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Pre-Joining Engagement
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Pre-joining communication when future employees go quiet before day one.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={JOINING_CONFIRMATION_PATH}
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Joining Confirmation
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Joining-intent checks so site managers get a reviewable picture of joiners.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={ONBOARDING_DOCUMENT_READINESS_PATH}
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Onboarding Document Readiness
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Checklist reminders for missing document-status updates with HR handoff.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/frontline-workforce-onboarding"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Frontline Workforce Onboarding
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Distributed frontline joining with clear first-day instructions across sites.
                </span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Survey & pulse workflows
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Protected feedback themes patterns for conversational surveys and recurring
            pulse listening. Capability status remains planned until product approval.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            <li>
              <Link
                href="/agents/ai-survey-agent"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  AI Survey Agent
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Conversational employee surveys with reviewable HR follow-up.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={EMPLOYEE_PULSE_SURVEYS_PATH}
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Employee Pulse Surveys
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Recurring pulse feedback on working conditions with protected themes.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={NEW_HIRE_CHECK_IN_SURVEYS_PATH}
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  New-Hire Check-In Surveys
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  30/60/90-day check-ins with protected feedback themes and HR handoff.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/exit-interview-agent"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Exit Interview Agent
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Voluntary exit feedback with respectful, reviewable outcomes.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/candidate-experience-surveys"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Candidate Experience Surveys
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Candidate journey feedback when applicants disengage mid-process.
                </span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Rehiring & alumni workflows
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Previous-versus-current talent profile patterns for alumni re-engagement.
            Capability status remains planned until product approval.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            <li>
              <Link
                href="/agents/ai-rehiring-agent"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  AI Rehiring Agent
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Alumni talent re-engagement with reviewable eligibility handoff.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/former-employee-rehiring"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Former Employee Rehiring
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Purpose-specific former employee outreach — planned until product approval.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/seasonal-workforce-rehiring"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Seasonal Workforce Rehiring
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Seasonal return campaigns with reviewable eligibility handoff.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/dormant-candidate-reactivation"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Dormant Candidate Reactivation
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Past applicant outreach with structured, human-reviewed outcomes.
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/agents/workforce-availability-refresh"
                className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-5 transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-lg font-semibold text-foreground">
                  Workforce Availability Refresh
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Availability and preference updates when talent records go stale.
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </AgentsShell>
  );
}
