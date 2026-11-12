import type { Metadata } from "next";
import Link from "next/link";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { CAPABILITIES_PATH, capabilitiesMetadata } from "@/lib/capabilities";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = capabilitiesMetadata();

type CapabilityListing = {
  id: string;
  name: string;
  description: string;
};

const CAPABILITY_LISTINGS: CapabilityListing[] = [
  {
    id: "ai-candidate-sourcing",
    name: "AI Candidate Sourcing",
    description:
      "Discovering and surfacing active and passive talent for open roles.",
  },
  {
    id: "vibe-sourcing",
    name: "Vibe Sourcing",
    description:
      "Identifying candidates whose working style and environment fit a team culture.",
  },
  {
    id: "ai-candidate-screening",
    name: "AI Candidate Screening",
    description:
      "Evaluating applicants against role requirements and qualifications.",
  },
  {
    id: "ai-candidate-matching",
    name: "AI Candidate Matching",
    description:
      "Comparing candidate profiles to open requisitions for fit.",
  },
  {
    id: "ai-candidate-outreach",
    name: "AI Candidate Outreach",
    description:
      "Reaching out to candidates through personalized messaging.",
  },
  {
    id: "ai-candidate-engagement",
    name: "AI Candidate Engagement",
    description:
      "Keeping candidates engaged throughout the hiring process.",
  },
  {
    id: "ai-interview-scheduling",
    name: "AI Interview Scheduling",
    description:
      "Coordinating interviews between candidates and hiring teams.",
  },
  {
    id: "ai-voice-interviews",
    name: "AI Voice Interviews",
    description:
      "Conducting preliminary screening conversations by voice.",
  },
  {
    id: "ai-recruitment-assessments",
    name: "AI Recruitment Assessments",
    description:
      "Assessing candidate skills through job-related evaluations.",
  },
  {
    id: "ai-recruitment-crm",
    name: "AI Recruitment CRM",
    description:
      "Managing candidate records and interaction history.",
  },
  {
    id: "ai-talent-pool-management",
    name: "AI Talent Pool Management",
    description:
      "Organizing and maintaining talent communities for future roles.",
  },
  {
    id: "ai-recruitment-analytics",
    name: "AI Recruitment Analytics",
    description:
      "Measuring hiring funnel activity and pipeline metrics.",
  },
  {
    id: "recruitment-workflow-automation",
    name: "Recruitment Workflow Automation",
    description:
      "Automating repetitive steps across the hiring process.",
  },
];

export default function CapabilitiesPage() {
  const pageUrl = absoluteUrl(CAPABILITIES_PATH);
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Capabilities" },
  ];

  const jsonLdBlocks = [
    webPageJsonLd({
      name: "AI Hiring Capabilities",
      description:
        "Explore Huntlo's AI hiring capabilities for candidate sourcing, screening, matching, outreach, interviews, assessments, scheduling and connected recruitment workflows.",
      url: pageUrl,
      primaryImageOfPage: OG_IMAGES.platform,
      aboutName: "AI Hiring Capabilities",
      mainEntityName: "Huntlo AI Hiring Capabilities",
    }),
    breadcrumbJsonLd(breadcrumbItems),
  ];

  return (
    <div className="landing-page selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <JsonLd data={jsonLdBlocks} />
      <LandingNav />
      <main className="px-4 py-8 md:px-8 md:py-12 lg:px-12">
        <div className="landing-compare-page">
          <div className="landing-compare-hero">
            <nav className="landing-compare-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <MaterialIcon name="chevron_right" className="landing-compare-breadcrumb-sep" />
              <span>Capabilities</span>
            </nav>

            <h1 className="landing-compare-hero-title">
              AI Hiring Capabilities: Smarter, Connected Hiring
            </h1>

            <div className="landing-compare-hero-intro">
              <p>
                Explore AI hiring capabilities from Huntlo, connecting candidate sourcing,
                intelligence, screening, outreach, interviews, assessments, scheduling and
                recruitment workflows through a connected human + AI hiring platform.
              </p>
            </div>
          </div>

          <section className="landing-compare-related landing-compare-hub-list">
            <h2 className="landing-compare-related-title">
              All AI hiring capabilities
            </h2>
            <div className="landing-compare-related-grid">
              {CAPABILITY_LISTINGS.map((cap) => (
                <Link
                  key={cap.id}
                  href={`/capabilities/${cap.id}`}
                  className="landing-compare-related-card"
                >
                  <p className="landing-compare-related-name">{cap.name}</p>
                  <p className="landing-compare-related-summary">
                    {cap.description}
                  </p>
                  <span className="landing-compare-related-cta">
                    View capability
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="landing-compare-cta mt-12 md:mt-16">
            <div className="landing-compare-cta-glow" aria-hidden />
            <h2>Try Huntlo for your team</h2>
            <p>
              Source talent, run multi-channel outreach, and manage hiring workflows in one
              recruiting OS.
            </p>
            <div className="landing-compare-cta-actions flex flex-col items-center gap-3">
              <Link href="/" className="dashboard-btn-primary text-sm">
                Try AI search
              </Link>
              <Link
                href="/signup"
                className="landing-compare-cta-secondary text-sm"
              >
                Create account
              </Link>
            </div>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
