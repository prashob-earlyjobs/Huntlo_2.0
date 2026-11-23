const DELIVERS = [
  "Agentic AI candidate sourcing across millions of profiles",
  "Autonomous outreach via Email, WhatsApp, and LinkedIn workflows",
  "AI Voice Recruiter for candidate screening and qualification",
  "Automated interview scheduling and follow-ups",
  "Candidate enrichment and contact discovery",
  "Collaborative hiring workflows for recruiters and hiring managers",
  "Access to experienced recruiters across key hiring markets",
  "Analytics, pipeline tracking, and hiring performance insights",
];

const WHO_USES = [
  "Staffing & Recruitment Agencies",
  "Executive Search Firms",
  "RPO Companies",
  "Startups and Scale-ups",
  "Enterprise Talent Acquisition Teams",
  "Global Capability Centers (GCCs)",
  "High-Volume Hiring Organizations",
];

export function AboutPageContent() {
  return (
    <div className="landing-legal-body mt-8">
      <p>
        Huntlo is agentic AI recruiting infrastructure built for high-growth hiring teams. After
        seeing firsthand how broken manual recruiting processes were, we built Huntlo to give every
        hiring organization autonomous AI agents that source, engage, screen, and schedule — without
        requiring manual recruiter intervention at every step.
      </p>
      <p>
        Instead of relying on job postings and manual sourcing, Huntlo proactively discovers,
        engages, and qualifies talent through agentic AI workflows. Recruiters describe roles in
        natural language, and Huntlo&apos;s AI searches 50+ platforms, runs autonomous outreach
        across email and WhatsApp, conducts AI voice screenings, schedules interviews, and manages
        hiring pipelines from one unified system. Huntlo also connects teams with experienced
        recruiters when human expertise is needed, helping organizations scale hiring faster across
        India, the US, the UK, the Middle East, and global markets.
      </p>

      <section className="landing-legal-section">
        <h2>Why We Built Huntlo</h2>
        <p>
          Recruiting teams were drowning in manual work — Boolean searches, copy-paste outreach,
          missed follow-ups, and scheduling back-and-forth. Point-solution tools solved one step but
          created tool sprawl. ATS platforms tracked applicants but didn&apos;t source passive
          talent. We believed the answer was agentic AI: autonomous agents that run the full outbound
          hiring workflow so recruiters can focus on relationships and hiring decisions.
        </p>
      </section>

      <section className="landing-legal-section">
        <h2>What Huntlo Delivers</h2>
        <ul>
          {DELIVERS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="landing-legal-section">
        <h2>Who Uses Huntlo</h2>
        <ul>
          {WHO_USES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="landing-legal-section">
        <h2>Our Mission</h2>
        <p>
          To help organizations hire faster, reduce recruitment costs, and eliminate repetitive
          recruiting tasks through autonomous AI agents—allowing recruiters and hiring managers to
          focus on building relationships and making better hiring decisions.
        </p>
        <p>
          Huntlo is building the future of recruiting where sourcing, outreach, screening, and
          scheduling happen automatically, while humans focus on hiring the right talent.
        </p>
      </section>
    </div>
  );
}
