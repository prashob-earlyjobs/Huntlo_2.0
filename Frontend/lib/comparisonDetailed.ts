export type { ComparisonFeatureValue, DetailedComparisonPage } from "./comparisonTypes";
import { comparisonPage as page, type DetailedComparisonPage } from "./comparisonTypes";
import { EXTENDED_COMPARISON_PAGES } from "./comparisonPagesExtended";

const LEGACY_COMPARISON_PAGES = [
  page({
    slug: "prism",
    name: "Prism",
    metaTitle: "Huntlo AI vs Prism: Hiring Infrastructure vs AI Recruiting Agency | Huntlo AI",
    metaDescription:
      "Compare Huntlo AI and Prism (tryprism.com) for AI-powered hiring. See how Huntlo AI's Agentic AI Hiring Infrastructure, run by your own team, compares to Prism's AI-native recruiting agency model with contingency-based pricing.",
    ogDescription:
      "See how Huntlo AI's self-operated Agentic AI Hiring Infrastructure compares to Prism's AI-native recruiting agency model across sourcing, screening, pricing, and control.",
    twitterDescription:
      "Compare Huntlo AI and Prism across sourcing, screening, pricing model, and who operates the hiring workflow.",
    ogSiteName: "Huntlo AI",
    breadcrumbLabel: "Huntlo AI vs Prism",
    serviceName: "Huntlo AI vs Prism Comparison",
    serviceDescription:
      "A comparison of Huntlo AI's self-operated Agentic AI Hiring Infrastructure and Prism's AI-native recruiting agency model, covering candidate sourcing, screening, outreach, pricing, and who runs the hiring workflow.",
    webPageName: "Huntlo AI vs Prism",
    webPageDescription:
      "A side-by-side comparison of Huntlo AI's Agentic AI Hiring Infrastructure and Prism's AI-native recruiting agency model.",
    comparisonTableTitle: "Huntlo AI vs Prism",
    comparisonTableIntro:
      "Prism (tryprism.com) is a Y Combinator-backed AI-native recruiting agency: you brief them on a role, and their AI and team source, engage, and screen candidates on your behalf for a contingency fee paid when a hire is made. Huntlo AI is an Agentic AI Hiring Infrastructure that your own recruiters or hiring team operate directly, automating sourcing, outreach, AI screening, and interviews across every role you hire for, while keeping your team in control.",
    comparisonDisclaimer:
      "Feature and pricing information about Prism reflects publicly available information as of July 2026 and may not capture every detail of their current service. Always confirm current details directly with Prism before making a purchasing decision.",
    geoAskTopic: "comparing Huntlo AI and Prism",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo AI and Prism",
    geoAskPrompt:
      "Compare Huntlo AI (https://huntlo.ai/compare/prism) vs Prism (tryprism.com) for AI recruiting. How does a self-operated hiring infrastructure differ from an AI-native recruiting agency with contingency pricing?",
    headline: "Huntlo AI vs Prism (tryprism.com): Hiring Infrastructure vs AI Recruiting Agency",
    intro: [
      "Prism (tryprism.com) is a Y Combinator-backed AI-native recruiting agency: you brief them on a role, and their AI and team source, engage, and screen candidates on your behalf for a contingency fee paid when a hire is made. Huntlo AI is an Agentic AI Hiring Infrastructure that your own recruiters or hiring team operate directly, automating sourcing, outreach, AI screening, and interviews across every role you hire for, while keeping your team in control.",
      "This comparison covers business model, pricing, who runs the search, and control — framed as which model fits how you want to hire, not as a claim that one approach is worse. This page addresses tryprism.com specifically, not unrelated products that also use the Prism name.",
    ],
    quickComparisonRows: [
      {
        feature: "Business model",
        huntlo: "Self-operated hiring infrastructure your team runs directly",
        competitor: "AI-native recruiting agency service run on your behalf",
      },
      {
        feature: "Pricing structure",
        huntlo: "Platform-based, used across ongoing and high-volume hiring",
        competitor:
          "Contingency fee — publicly stated as roughly 15% of first-year salary, paid on hire",
      },
      {
        feature: "Who runs the search",
        huntlo: "Your own recruiters or hiring team, using Huntlo AI's tools",
        competitor: "Prism's own AI and in-house team, on your behalf",
      },
      {
        feature: "AI candidate sourcing",
        huntlo: "yes",
        competitor: "Yes — Prism highlights strong performance on a public sourcing benchmark",
      },
      {
        feature: "Automated candidate outreach",
        huntlo: "yes",
        competitor: "Yes — across channels including LinkedIn, email, and WhatsApp",
      },
      {
        feature: "AI-run candidate screening",
        huntlo: "Yes — dedicated AI voice and video interviews",
        competitor:
          "Prism describes AI-managed outreach and initial screening calls; not specified as a standalone product feature you configure yourself",
      },
      {
        feature: "Ongoing use across many roles/hiring types",
        huntlo:
          "Yes — built for staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
        competitor:
          "Positioned per-search, best suited to filling specific (often technical) roles rather than operating as a team's everyday hiring infrastructure",
      },
      {
        feature: "Team owns and controls the process",
        huntlo: "yes",
        competitor:
          "Limited — Prism runs sourcing and screening; you step in at the interview and offer stage",
      },
    ],
    bestFor: {
      huntlo: "Agentic AI Hiring Infrastructure",
      competitor: "AI-native recruiting agency (contingency)",
    },
    chooseHuntlo: [
      "Want self-operated Agentic AI Hiring Infrastructure your team owns and runs",
      "Need ongoing or high-volume hiring across many roles and hiring types",
      "Want dedicated AI voice and video interviews within your own workflow",
      "Prefer platform-based pricing over paying a contingency fee per successful placement",
    ],
    chooseCompetitor: [
      "Want to fully outsource a specific, often technical search",
      "Prefer to pay only on a successful hire (contingency model)",
      "Do not want to operate hiring software yourselves",
      "Are filling discrete roles rather than building everyday hiring infrastructure",
    ],
    whatIsHuntlo: {
      lead: "Huntlo AI is an Agentic AI Hiring Infrastructure that your own recruiters or hiring team operate directly, automating sourcing, outreach, AI screening, and interviews while keeping your team in control of the process.",
      bullets: [
        "Self-operated sourcing, outreach, and AI screening",
        "Dedicated AI voice and video interviews",
        "Platform-based use across ongoing and high-volume hiring",
        "Built for staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
      ],
      philosophy: "Your team owns and operates the hiring process.",
      closing:
        "Suits teams that want ongoing, owned hiring capability rather than paying per successful placement.",
    },
    whatIsCompetitor: {
      lead: "Prism (tryprism.com) positions itself as an AI-native recruiting agency rather than self-serve software. Clients brief Prism on a role, and Prism's own AI and team run the search, charging a percentage of the candidate's first-year salary when a hire is made — similar to a traditional contingency recruiting agency but powered by AI.",
      bullets: [
        "Slack-based role briefing process (as publicly described)",
        "AI-driven sourcing, outreach (LinkedIn, email, WhatsApp), and screening calls",
        "Publicly stated contingency fee of around 15% of first-year salary, paid on hire",
        "Positioned toward technical roles and fast-scaling companies",
      ],
      closing:
        "A legitimate alternative for buyers who want to outsource a hard-to-fill search with no internal bandwidth. Details such as pricing and positioning are publicly stated as of mid-2026 and may change — confirm directly with Prism.",
    },
    featureComparison: [
      {
        capability: "Business model",
        huntlo: "Self-operated hiring infrastructure your team runs directly",
        competitor: "AI-native recruiting agency service run on your behalf",
      },
      {
        capability: "Pricing structure",
        huntlo: "Platform-based, used across ongoing and high-volume hiring",
        competitor:
          "Contingency fee — publicly stated as roughly 15% of first-year salary, paid on hire",
      },
      {
        capability: "Who runs the search",
        huntlo: "Your own recruiters or hiring team, using Huntlo AI's tools",
        competitor: "Prism's own AI and in-house team, on your behalf",
      },
      {
        capability: "AI candidate sourcing",
        huntlo: "Yes",
        competitor: "Yes — Prism highlights strong performance on a public sourcing benchmark",
      },
      {
        capability: "Automated candidate outreach",
        huntlo: "Yes",
        competitor: "Yes — across channels including LinkedIn, email, and WhatsApp",
      },
      {
        capability: "AI-run candidate screening",
        huntlo: "Yes — dedicated AI voice and video interviews",
        competitor:
          "Prism describes AI-managed outreach and initial screening calls; not specified as a standalone product feature you configure yourself",
      },
      {
        capability: "Ongoing use across many roles/hiring types",
        huntlo:
          "Yes — built for staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
        competitor:
          "Positioned per-search, best suited to filling specific (often technical) roles rather than operating as a team's everyday hiring infrastructure",
      },
      {
        capability: "Team owns and controls the process",
        huntlo: "Yes",
        competitor:
          "Limited — Prism runs sourcing and screening; you step in at the interview and offer stage",
      },
    ],
    biggestDifference:
      "This is a category difference, not a feature gap: Prism is a service/agency you outsource a search to (and pay a contingency fee on success), while Huntlo AI is Agentic AI Hiring Infrastructure your own team operates on an ongoing basis across many roles.",
    workflowHuntlo: [
      "Source talent",
      "Launch outreach",
      "AI voice / video screen",
      "Recruiter review",
      "Interview & hire",
    ],
    workflowCompetitor: [
      "Brief Prism on the role",
      "Prism AI + team sources & engages",
      "Initial screening calls",
      "Shortlist delivered to you",
      "You interview & offer (contingency fee on hire)",
    ],
    workflowNote:
      "Teams that want to fully outsource a specific technical search and pay only on hire may prefer Prism's agency model. Teams that want to run their own agentic hiring workflows for ongoing or high-volume hiring, while keeping recruiters in control, are typically better served by Huntlo AI's infrastructure approach.",
    useCases: [
      { useCase: "Outsource a single hard-to-fill technical search", recommended: "Prism" },
      { useCase: "Pay only on successful hire (contingency)", recommended: "Prism" },
      { useCase: "Self-operated ongoing hiring infrastructure", recommended: "Huntlo" },
      { useCase: "AI voice & video interview screening you configure", recommended: "Huntlo" },
      { useCase: "Staffing / recruitment firms / executive search ops", recommended: "Huntlo" },
      { useCase: "AI candidate sourcing", recommended: "Both" },
      { useCase: "Automated outreach (LinkedIn / email / WhatsApp)", recommended: "Both" },
    ],
    prosHuntlo: [
      "Self-operated Agentic AI Hiring Infrastructure",
      "Platform-based use across many roles and hiring types",
      "Dedicated AI voice and video interviews your team configures",
      "Recruiters stay in control of the full process",
    ],
    considerationHuntlo:
      "Requires your team to operate the platform — not a fully outsourced search service.",
    prosCompetitor: [
      "Legitimate agency alternative for buyers without internal bandwidth",
      "Publicly stated contingency pricing — pay on hire",
      "AI-driven sourcing, multi-channel outreach, and screening run on your behalf",
    ],
    considerationCompetitor:
      "Not self-serve hiring infrastructure — Prism runs the search; you step in at interview/offer. Positioned per-search rather than as everyday owned hiring ops. Confirm current pricing and service details directly (tryprism.com; not to be confused with unrelated Prism-named products).",
    faq: [
      {
        question: "What is the difference between Huntlo AI and Prism?",
        answer:
          "Prism is an AI-native recruiting agency: you brief them on a role and their AI and team source, engage, and screen candidates on your behalf, handing you a shortlist to interview, for a contingency fee paid on hire. Huntlo AI is an Agentic AI Hiring Infrastructure that your own recruiters or hiring team operate directly, automating sourcing, outreach, AI screening, and interviews while keeping your team in control of the process.",
      },
      {
        question: "Is Prism a software platform or a recruiting agency?",
        answer:
          "Prism positions itself as an AI-native recruiting agency rather than self-serve software. Clients brief Prism on a role, and Prism's own AI and team run the search, charging a percentage of the candidate's first-year salary when a hire is made, similar to a traditional contingency recruiting agency but powered by AI.",
      },
      {
        question: "How does pricing compare between Huntlo AI and Prism?",
        answer:
          "Prism uses a contingency model, publicly stating a fee of around 15 percent of a candidate's first-year salary charged only when a hire signs. Huntlo AI operates as hiring infrastructure that a team uses across many roles and hiring types, which suits teams that want ongoing, owned hiring capability rather than paying per successful placement.",
      },
      {
        question: "Who should choose Prism instead of Huntlo AI?",
        answer:
          "Teams that want to fully outsource a specific, often technical search and pay only on a successful hire may prefer Prism's agency model. Teams that want to run their own agentic hiring workflows across sourcing, screening, and interviews for ongoing or high-volume hiring, while keeping recruiters in control, are typically better served by Huntlo AI's infrastructure approach.",
      },
    ],
    finalVerdict: [
      "Prism (tryprism.com) is an AI-native recruiting agency with contingency pricing — a legitimate choice for outsourcing a discrete, often technical search.",
      "Huntlo AI is self-operated Agentic AI Hiring Infrastructure for teams that want ongoing owned hiring capability across many roles.",
      "Pick the model that fits how you want to hire — not a feature-gap takedown.",
    ],
  }),
  page({
    slug: "contrario",
    name: "Contrario",
    metaTitle: "Huntlo AI vs Contrario: Hiring Infrastructure vs Recruiter Network | Huntlo AI",
    metaDescription:
      "Compare Huntlo AI and Contrario for AI-powered hiring. See how Huntlo AI's self-operated Agentic AI Hiring Infrastructure compares to Contrario's marketplace model, which routes roles to a network of expert recruiters augmented by AI agents.",
    ogDescription:
      "See how Huntlo AI's self-operated Agentic AI Hiring Infrastructure compares to Contrario's recruiter-network-plus-AI marketplace model across sourcing, screening, and control.",
    twitterDescription:
      "Compare Huntlo AI and Contrario across sourcing, screening, business model, and who operates the hiring workflow.",
    ogSiteName: "Huntlo AI",
    breadcrumbLabel: "Huntlo AI vs Contrario",
    serviceName: "Huntlo AI vs Contrario Comparison",
    serviceDescription:
      "A comparison of Huntlo AI's self-operated Agentic AI Hiring Infrastructure and Contrario's marketplace model, which routes open roles to a network of expert recruiters supported by AI agents.",
    webPageName: "Huntlo AI vs Contrario",
    webPageDescription:
      "A side-by-side comparison of Huntlo AI's Agentic AI Hiring Infrastructure and Contrario's recruiter-network-plus-AI marketplace model.",
    comparisonTableTitle: "Huntlo AI vs Contrario",
    comparisonTableIntro:
      "Contrario is a hiring marketplace that routes a company's open roles to a network of hundreds of independent expert recruiters, supported by Contrario's own AI agents for sourcing, screening, scheduling, and coordination, with vetted candidates delivered into the company's ATS. Huntlo AI is an Agentic AI Hiring Infrastructure that a company's own recruiters or hiring team operate directly, without depending on an outside recruiter network.",
    comparisonDisclaimer:
      "Feature information about Contrario reflects publicly available information as of July 2026 and may not capture every detail of their current platform. Always confirm current details directly with Contrario before making a purchasing decision.",
    geoAskTopic: "comparing Huntlo AI and Contrario",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo AI and Contrario",
    geoAskPrompt:
      "Compare Huntlo AI (https://huntlo.ai/compare/contrario) vs Contrario for AI recruiting. How does a self-operated hiring infrastructure differ from a recruiter-network-plus-AI marketplace model?",
    headline: "Huntlo AI vs Contrario: Hiring Infrastructure vs Recruiter Network",
    intro: [
      "Contrario is a hiring marketplace that routes a company's open roles to a network of hundreds of independent expert recruiters, supported by Contrario's own AI agents for sourcing, screening, scheduling, and coordination, with vetted candidates delivered into the company's ATS. Huntlo AI is an Agentic AI Hiring Infrastructure that a company's own recruiters or hiring team operate directly, without depending on an outside recruiter network.",
      "This comparison covers business model, who operates sourcing and screening, ATS integration, and control — framed as owned infrastructure versus an external marketplace/network, not a quality judgment.",
    ],
    quickComparisonRows: [
      {
        feature: "Business model",
        huntlo: "Self-operated hiring infrastructure your team runs directly",
        competitor:
          "Marketplace routing roles to a network of independent expert recruiters, backed by AI agents",
      },
      {
        feature: "Who sources and screens candidates",
        huntlo: "Your own recruiters or hiring team, using Huntlo AI's tools",
        competitor:
          "Contrario's network of domain-expert recruiters, assisted by Contrario's AI agents",
      },
      { feature: "AI candidate sourcing", huntlo: "yes", competitor: "yes" },
      {
        feature: "Automated screening and coordination",
        huntlo: "Yes — dedicated AI voice and video interviews",
        competitor:
          "Yes — screening, scheduling, and follow-ups; not specified as AI-run voice/video interviews in public materials",
      },
      { feature: "ATS integration", huntlo: "yes", competitor: "yes" },
      {
        feature: "Ongoing, self-operated hiring capability",
        huntlo: "Yes — used continuously across many roles and hiring types",
        competitor:
          "Positioned per-role, routed through the recruiter network rather than operated by the hiring team itself",
      },
      {
        feature: "Team owns and controls the process",
        huntlo: "yes",
        competitor:
          "Limited — sourcing and initial screening run through Contrario's recruiter network",
      },
      {
        feature: "Dedicated solutions per hiring team type",
        huntlo:
          "Yes — staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
        competitor: "Positioned primarily toward high-growth startups and scaling companies",
      },
    ],
    bestFor: {
      huntlo: "Agentic AI Hiring Infrastructure",
      competitor: "Recruiter-network marketplace with AI support",
    },
    chooseHuntlo: [
      "Want self-operated Agentic AI Hiring Infrastructure your team owns and runs",
      "Need dedicated AI voice and video interviews within your own workflow",
      "Need ongoing or high-volume hiring across many roles and team types",
      "Want dedicated solutions for staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
    ],
    chooseCompetitor: [
      "Want to tap an external network of domain-expert recruiters for specific critical hires",
      "Prefer not to operate a recruiting tool yourselves",
      "Want candidates delivered into your existing ATS pipeline via a marketplace model",
      "Are a high-growth startup or scaling company seeking specialist recruiter help",
    ],
    whatIsHuntlo: {
      lead: "Huntlo AI is an Agentic AI Hiring Infrastructure that a company's own recruiters or hiring team operate directly.",
      bullets: [
        "AI candidate sourcing",
        "Automated outreach",
        "Dedicated AI voice and video interviews",
        "ATS integration",
        "Self-operated workflows across staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
      ],
      philosophy: "Your team owns and operates the hiring process — no external recruiter network required.",
      closing:
        "Huntlo AI automates sourcing, outreach, AI screening, and interview coordination within the hiring team's own workflow.",
    },
    whatIsCompetitor: {
      lead: "Contrario is a hiring marketplace that routes open roles to a network of independent expert recruiters, supported by Contrario's own AI agents for sourcing, screening, scheduling, and coordination.",
      bullets: [
        "Network of hundreds of independent expert recruiters",
        "AI agents supporting sourcing, screening, and coordination",
        "Candidates delivered into the company's existing ATS",
        "Slack and ATS integrations",
        "Positioned toward high-growth startups and scaling companies",
      ],
      closing:
        "Contrario positions itself between a traditional recruiting agency and pure recruiting software — a recruiter-network-plus-AI marketplace model.",
    },
    featureComparison: [
      {
        capability: "Business model",
        huntlo: "Self-operated hiring infrastructure your team runs directly",
        competitor:
          "Marketplace routing roles to a network of independent expert recruiters, backed by AI agents",
      },
      {
        capability: "Who sources and screens candidates",
        huntlo: "Your own recruiters or hiring team, using Huntlo AI's tools",
        competitor:
          "Contrario's network of domain-expert recruiters, assisted by Contrario's AI agents",
      },
      {
        capability: "AI candidate sourcing",
        huntlo: "Yes",
        competitor: "Yes — AI agents support the recruiter network's sourcing work",
      },
      {
        capability: "Automated screening and coordination",
        huntlo: "Yes — dedicated AI voice and video interviews",
        competitor:
          "Yes — Contrario states its platform handles screening, scheduling, and follow-ups; not specified as AI-run voice/video interviews in public materials",
      },
      {
        capability: "ATS integration",
        huntlo: "Yes",
        competitor: "Yes — candidates delivered directly into a company's existing ATS pipeline",
      },
      {
        capability: "Ongoing, self-operated hiring capability",
        huntlo: "Yes — used continuously across many roles and hiring types",
        competitor:
          "Positioned per-role, routed through the recruiter network rather than operated by the hiring team itself",
      },
      {
        capability: "Team owns and controls the process",
        huntlo: "Yes",
        competitor:
          "Limited — sourcing and initial screening run through Contrario's recruiter network; the hiring team engages once candidates reach the pipeline",
      },
      {
        capability: "Dedicated solutions per hiring team type",
        huntlo:
          "Yes — staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
        competitor: "Positioned primarily toward high-growth startups and scaling companies",
      },
    ],
    biggestDifference:
      "Huntlo AI is Agentic AI Hiring Infrastructure the hiring team owns and operates itself; Contrario is a marketplace/network the company relies on externally — recruiters plus AI, not pure software your team runs.",
    workflowHuntlo: [
      "Source",
      "Outreach",
      "AI voice screening",
      "AI video interviews",
      "Coordinate in your ATS",
      "Hire",
    ],
    workflowCompetitor: [
      "Post role to Contrario",
      "Network recruiters + AI agents source",
      "Screening, scheduling, follow-ups",
      "Candidates delivered to ATS",
      "Hiring team engages",
    ],
    workflowNote:
      "Teams that want to run and own agentic hiring workflows internally, across ongoing or high-volume hiring, may prefer Huntlo AI. Teams that want external domain-expert recruiters for specific critical hires without operating a recruiting tool themselves may prefer Contrario.",
    useCases: [
      { useCase: "Self-operated ongoing hiring", recommended: "Huntlo" },
      { useCase: "High-volume hiring infrastructure", recommended: "Huntlo" },
      { useCase: "Staffing agencies & recruitment firms", recommended: "Huntlo" },
      { useCase: "Executive search (owned workflow)", recommended: "Huntlo" },
      { useCase: "External specialist recruiters for critical hires", recommended: "Contrario" },
      { useCase: "Marketplace model without adopting new recruiting software", recommended: "Contrario" },
      { useCase: "High-growth startups seeking network recruiters", recommended: "Contrario" },
      { useCase: "AI voice & video interview automation", recommended: "Huntlo" },
    ],
    prosHuntlo: [
      "Self-operated Agentic AI Hiring Infrastructure",
      "Team owns sourcing, screening, and interview workflows",
      "Dedicated AI voice and video interviews",
      "Solutions across staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
    ],
    considerationHuntlo:
      "Requires your team to operate the infrastructure — not an outsourced recruiter network for one-off critical hires.",
    prosCompetitor: [
      "Access to a network of independent domain-expert recruiters",
      "AI agents supporting sourcing, screening, and coordination",
      "Candidates delivered into existing ATS without adopting new recruiting software",
    ],
    considerationCompetitor:
      "Sourcing and initial screening run through an external network; the hiring team has limited control until candidates reach the pipeline. Public materials do not clearly specify AI-run voice or video interviews.",
    faq: [
      {
        question: "What is the difference between Huntlo AI and Contrario?",
        answer:
          "Contrario is a marketplace that routes a company's open roles to a network of independent expert recruiters, supported by Contrario's own AI agents for sourcing, screening, and coordination. Huntlo AI is an Agentic AI Hiring Infrastructure that a company's own recruiters or hiring team operate directly, automating sourcing, outreach, AI screening, and interviews without depending on an external recruiter network.",
      },
      {
        question: "Is Contrario a recruiting agency, a marketplace, or software?",
        answer:
          "Contrario describes itself as combining a network of expert recruiters with AI agents, positioning itself between a traditional recruiting agency and pure recruiting software. Candidates are sourced through Contrario's recruiter network and AI agents, then delivered into a company's existing applicant tracking system.",
      },
      {
        question: "Does Huntlo AI depend on an external recruiter network like Contrario?",
        answer:
          "No. Huntlo AI is designed for a company's own recruiters or hiring team to operate directly. It does not route roles to an outside network of independent recruiters; instead, it automates sourcing, outreach, AI screening, and interview coordination within the hiring team's own workflow.",
      },
      {
        question: "Who should choose Contrario instead of Huntlo AI?",
        answer:
          "Teams that want to tap into an external network of domain-expert recruiters for specific critical hires, without operating a recruiting tool themselves, may prefer Contrario's marketplace model. Teams that want to run and own their agentic hiring workflows internally, across ongoing or high-volume hiring, are typically better served by Huntlo AI's infrastructure approach.",
      },
    ],
    finalVerdict: [
      "Contrario's recruiter-network-plus-AI marketplace is a legitimate fit for teams that want external specialist help without adopting new software — especially high-growth startups and scaling companies.",
      "Huntlo AI is Agentic AI Hiring Infrastructure the hiring team owns and operates itself: sourcing, outreach, AI screening, and interviews across ongoing and high-volume hiring, with dedicated solutions by team type.",
      "The fair differentiation is who operates the workflow — owned infrastructure versus an external marketplace/network — not which model is universally better.",
    ],
  }),
  page({
    slug: "juicebox",
    name: "Juicebox",
    metaTitle: "Huntlo AI vs Juicebox: Agentic Hiring Infrastructure vs AI Sourcing | Huntlo AI",
    metaDescription:
      "Compare Huntlo AI and Juicebox for AI-powered recruiting. See how Huntlo AI's Agentic AI Hiring Infrastructure extends beyond sourcing and outreach into AI voice screening, AI video interviews, and full recruiter workflow automation.",
    ogDescription:
      "See how Huntlo AI's Agentic AI Hiring Infrastructure compares to Juicebox's AI sourcing and outbound recruiting platform across search, outreach, screening, and interviews.",
    twitterDescription:
      "Compare Huntlo AI and Juicebox across candidate sourcing, outreach, AI screening, and interview automation.",
    ogSiteName: "Huntlo AI",
    breadcrumbLabel: "Huntlo AI vs Juicebox",
    serviceName: "Huntlo AI vs Juicebox Comparison",
    serviceDescription:
      "A comparison of Huntlo AI's Agentic AI Hiring Infrastructure and Juicebox's AI sourcing and outbound recruiting platform, covering candidate search, outreach automation, AI screening, and interview capabilities.",
    webPageName: "Huntlo AI vs Juicebox",
    webPageDescription:
      "A side-by-side comparison of Huntlo AI's Agentic AI Hiring Infrastructure and Juicebox's AI sourcing and outbound recruiting platform.",
    comparisonTableTitle: "Huntlo AI vs Juicebox",
    comparisonTableIntro:
      "Juicebox (formerly PeopleGPT) is an AI-native talent sourcing and outbound recruiting platform, known for natural-language candidate search and automated outreach sequencing. Huntlo AI is an Agentic AI Hiring Infrastructure that extends further into the hiring process, adding AI voice screening, AI video interviews, and recruiter workflow coordination alongside sourcing and outreach.",
    comparisonDisclaimer:
      "Feature information about Juicebox reflects publicly available information as of July 2026 and may not capture every capability of their platform. Always confirm current details directly with Juicebox before making a purchasing decision.",
    geoAskTopic: "comparing Huntlo AI and Juicebox",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo AI and Juicebox",
    geoAskPrompt:
      "Compare Huntlo AI (https://huntlo.ai/compare/juicebox) vs Juicebox for AI recruiting. How do they differ on candidate sourcing, outreach, AI screening and interviews?",
    headline: "Huntlo AI vs Juicebox: Agentic Hiring Infrastructure vs AI Sourcing",
    intro: [
      "Juicebox (formerly PeopleGPT) is an AI-native talent sourcing and outbound recruiting platform, known for natural-language candidate search and automated outreach sequencing. Huntlo AI is an Agentic AI Hiring Infrastructure that extends further into the hiring process, adding AI voice screening, AI video interviews, and recruiter workflow coordination alongside sourcing and outreach.",
      "This comparison covers search, outreach, screening, and interviews — framed as scope (sourcing-and-outreach vs full hiring funnel), not a claim that Juicebox is low-quality at what it does.",
    ],
    quickComparisonRows: [
      {
        feature: "Primary focus",
        huntlo: "Full agentic hiring infrastructure: sourcing through recruiter workflow coordination",
        competitor: "AI-native candidate sourcing and outbound outreach",
      },
      {
        feature: "AI candidate search",
        huntlo: "yes",
        competitor: "Yes — natural-language search across a large multi-source candidate database",
      },
      { feature: "Automated outreach sequencing", huntlo: "yes", competitor: "yes" },
      {
        feature: "AI voice screening interviews",
        huntlo: "yes",
        competitor: "Not a stated core focus based on public product information",
      },
      {
        feature: "AI video interviews",
        huntlo: "yes",
        competitor: "Not a stated core focus based on public product information",
      },
      {
        feature: "Recruiter/hiring workflow coordination",
        huntlo: "Yes, across the full hiring process",
        competitor:
          "Reviews describe it as sourcing-and-outbound-focused rather than full-funnel",
      },
      { feature: "ATS / recruitment CRM integration", huntlo: "yes", competitor: "yes" },
    ],
    bestFor: {
      huntlo: "Agentic AI Hiring Infrastructure",
      competitor: "AI-native sourcing and outbound recruiting",
    },
    chooseHuntlo: [
      "Want full-funnel Agentic AI Hiring Infrastructure including AI voice screening and AI video interviews",
      "Need sourcing and outreach plus screening, interviews, and recruiter workflow coordination in one system",
      "Want to replace or extend beyond a sourcing-and-outbound tool for later funnel stages",
      "Need ATS / recruitment CRM integration with full hiring workflow coverage",
    ],
    chooseCompetitor: [
      "Natural-language candidate search and outbound outreach are the primary need",
      "Already have screening, interview, and workflow tools in place",
      "Want an AI-native sourcing platform known for PeopleGPT-style search",
      "Prefer a tool focused on discovery and outbound sequencing rather than full-funnel automation",
    ],
    whatIsHuntlo: {
      lead: "Huntlo AI is an Agentic AI Hiring Infrastructure that covers sourcing and outreach as well as AI voice screening, AI video interviews, and recruiter workflow coordination in one system.",
      bullets: [
        "AI candidate search and sourcing",
        "Automated outreach sequencing",
        "AI voice screening and AI video interviews",
        "Recruiter/hiring workflow coordination across the full process",
        "ATS and recruitment CRM integration",
      ],
      philosophy: "Full-funnel scope — sourcing through screening and interviews — not sourcing-and-outbound alone.",
      closing:
        "Some teams use Huntlo AI as a full replacement covering sourcing through screening; others use it alongside existing sourcing tools for later funnel stages.",
    },
    whatIsCompetitor: {
      lead: "Juicebox (formerly PeopleGPT) is an AI-native talent sourcing and outbound recruiting platform, known for natural-language candidate search and automated outreach sequencing.",
      bullets: [
        "Natural-language candidate search across a large multi-source database",
        "Automated outreach sequencing",
        "ATS integrations with common recruiting systems",
        "Strongest differentiation in discovery and outbound recruiting",
      ],
      closing:
        "Third-party reviews describe Juicebox as primarily focused on sourcing and outbound recruiting rather than full-funnel workflows.",
    },
    featureComparison: [
      {
        capability: "Primary focus",
        huntlo: "Full agentic hiring infrastructure: sourcing through recruiter workflow coordination",
        competitor: "AI-native candidate sourcing and outbound outreach",
      },
      {
        capability: "AI candidate search",
        huntlo: "Yes",
        competitor: "Yes — natural-language search across a large multi-source candidate database",
      },
      {
        capability: "Automated outreach sequencing",
        huntlo: "Yes",
        competitor: "Yes",
      },
      {
        capability: "AI voice screening interviews",
        huntlo: "Yes",
        competitor: "Not a stated core focus based on public product information",
      },
      {
        capability: "AI video interviews",
        huntlo: "Yes",
        competitor: "Not a stated core focus based on public product information",
      },
      {
        capability: "Recruiter/hiring workflow coordination",
        huntlo: "Yes, across the full hiring process",
        competitor:
          "Reviews describe it as sourcing-and-outbound-focused rather than full-funnel",
      },
      {
        capability: "ATS / recruitment CRM integration",
        huntlo: "Yes",
        competitor: "Yes",
      },
    ],
    biggestDifference:
      "Juicebox is an AI-native sourcing and outbound recruiting platform — genuinely strong at natural-language search and outreach. Huntlo AI is Agentic AI Hiring Infrastructure that extends further into AI voice screening, AI video interviews, and full recruiter workflow coordination. Differentiation is scope, not quality at sourcing.",
    workflowHuntlo: [
      "Source",
      "Outreach",
      "AI voice screening",
      "AI video interviews",
      "Recruiter workflow coordination",
      "Hire",
    ],
    workflowCompetitor: [
      "Natural-language search",
      "Discover candidates",
      "Automated outreach sequencing",
      "ATS handoff",
      "Downstream hiring tools",
    ],
    workflowNote:
      "Teams focused primarily on AI sourcing and outbound may prefer Juicebox. Teams that want full-funnel Agentic AI Hiring Infrastructure including AI screening and interviews may prefer Huntlo AI — alone or alongside existing sourcing tools.",
    useCases: [
      { useCase: "Natural-language AI talent search", recommended: "Juicebox" },
      { useCase: "Outbound outreach sequencing", recommended: "Both" },
      { useCase: "AI voice & video interview screening", recommended: "Huntlo" },
      { useCase: "Full-funnel hiring automation", recommended: "Huntlo" },
      { useCase: "Recruiter workflow coordination end-to-end", recommended: "Huntlo" },
      { useCase: "Replace or extend sourcing tool for screening stages", recommended: "Huntlo" },
      { useCase: "ATS / CRM-integrated discovery only", recommended: "Juicebox" },
    ],
    prosHuntlo: [
      "Agentic AI Hiring Infrastructure across the full funnel",
      "AI voice screening and AI video interviews as core workflow",
      "Sourcing and outreach plus recruiter workflow coordination",
      "Can replace a sourcing tool or sit alongside it for later stages",
    ],
    considerationHuntlo:
      "Broader scope than a sourcing-and-outbound specialist — choose based on whether you need screening and interviews in the same system.",
    prosCompetitor: [
      "AI-native natural-language candidate search (PeopleGPT heritage)",
      "Strong automated outbound outreach sequencing",
      "ATS integrations with common recruiting stacks",
    ],
    considerationCompetitor:
      "Reviews describe it as sourcing-and-outbound-focused rather than full-funnel. AI voice/video interview screening is not a stated core focus based on public product information — re-verify before publishing.",
    faq: [
      {
        question: "What is the difference between Huntlo AI and Juicebox?",
        answer:
          "Juicebox is an AI-native sourcing and outbound recruiting platform focused on natural-language candidate search and automated outreach sequencing. Huntlo AI is an Agentic AI Hiring Infrastructure that covers sourcing and outreach as well as AI voice screening, AI video interviews, and recruiter workflow coordination in one system.",
      },
      {
        question: "Does Juicebox offer AI interview screening like Huntlo AI?",
        answer:
          "Juicebox is primarily known for candidate search and outbound outreach rather than AI-led voice or video interview screening. Huntlo AI includes AI voice screening and AI video interviews as part of its core hiring workflow, in addition to sourcing and outreach.",
      },
      {
        question: "Can Huntlo AI replace Juicebox, or do teams use both?",
        answer:
          "Some teams use Huntlo AI as a full replacement covering sourcing through screening, while others use Huntlo AI alongside existing sourcing tools for the screening, interview, and recruiter workflow stages. Huntlo AI is built to integrate with existing ATS and recruiting tech stacks either way.",
      },
      {
        question: "Which is better for full-funnel hiring automation, Huntlo AI or Juicebox?",
        answer:
          "Third-party reviews describe Juicebox as primarily focused on sourcing and outbound recruiting rather than full-funnel workflows. Huntlo AI is built as full-funnel Agentic AI Hiring Infrastructure, automating sourcing, outreach, AI screening, interviews, and recruiter coordination in a single system.",
      },
    ],
    finalVerdict: [
      "Juicebox is a strong AI-native sourcing and outbound recruiting platform — position that fairly; do not frame it as outdated or inferior at discovery.",
      "Huntlo AI is Agentic AI Hiring Infrastructure that extends into AI voice screening, AI video interviews, and recruiter workflow coordination alongside sourcing and outreach.",
      "The fair differentiation is scope. Spot-check Juicebox's current site before launch and re-verify periodically.",
    ],
  }),
  page({
    slug: "qureos",
    name: "Qureos",
    metaTitle: "Huntlo AI vs Qureos: Agentic Hiring Infrastructure Compared | Huntlo AI",
    metaDescription:
      "Compare Huntlo AI and Qureos for agentic AI recruiting. See how Huntlo AI's configurable Agentic AI Hiring Infrastructure compares to Qureos's Iris platform across sourcing, screening, AI interviews, and ATS integrations.",
    ogDescription:
      "See how Huntlo AI's Agentic AI Hiring Infrastructure compares to Qureos's Iris platform across candidate sourcing, screening, outreach, AI interviews, and integrations.",
    twitterDescription:
      "Compare Huntlo AI and Qureos across candidate sourcing, screening, outreach, AI interviews, and ATS integrations.",
    ogSiteName: "Huntlo AI",
    breadcrumbLabel: "Huntlo AI vs Qureos",
    serviceName: "Huntlo AI vs Qureos Comparison",
    serviceDescription:
      "A comparison of Huntlo AI's Agentic AI Hiring Infrastructure and Qureos's Iris agentic recruiting platform, covering candidate sourcing, screening, outreach, interview automation, and ATS/HRIS integrations.",
    webPageName: "Huntlo AI vs Qureos",
    webPageDescription:
      "A side-by-side comparison of Huntlo AI's Agentic AI Hiring Infrastructure and Qureos's Iris agentic recruiting platform.",
    comparisonTableTitle: "Huntlo AI vs Qureos",
    comparisonTableIntro:
      "Qureos, powered by its AI agent Iris, is an agentic recruiting platform built for high-volume hiring, with strong specialization in GCC and MENA markets. Huntlo AI is an Agentic AI Hiring Infrastructure built with configurable, recruiter-controlled workflows tailored to different types of hiring teams — staffing agencies, recruitment firms, executive search, startups, enterprise talent teams, and GCCs.",
    comparisonDisclaimer:
      "Feature information about Qureos reflects publicly available information as of July 2026 and may not capture every capability of their platform. Always confirm current details directly with Qureos before making a purchasing decision.",
    geoAskTopic: "comparing Huntlo AI and Qureos",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo AI and Qureos",
    geoAskPrompt:
      "Compare Huntlo AI (https://huntlo.ai/compare/qureos) vs Qureos for agentic AI recruiting. How do they differ on sourcing, screening, AI interviews and ATS integrations?",
    headline: "Huntlo AI vs Qureos: Agentic Hiring Infrastructure Compared",
    intro: [
      "Qureos, powered by its AI agent Iris, is an agentic recruiting platform built for high-volume hiring, with strong specialization in GCC and MENA markets. Huntlo AI is an Agentic AI Hiring Infrastructure built with configurable, recruiter-controlled workflows tailored to different types of hiring teams — staffing agencies, recruitment firms, executive search, startups, enterprise talent teams, and GCCs.",
      "Unlike sourcing-only comparisons, Qureos is itself a broad, full-funnel agentic platform — including in the GCC segment where Huntlo also competes. The fair differentiation is breadth of audience-specific configuration and recruiter-in-control framing, not a claim that Qureos lacks functionality.",
    ],
    quickComparisonRows: [
      {
        feature: "Primary focus",
        huntlo:
          "Configurable agentic hiring infrastructure tailored per hiring team type, with recruiters kept in control",
        competitor:
          "Full-funnel agentic recruiting platform (Iris), built for high-volume hiring with strong GCC/MENA specialization",
      },
      {
        feature: "AI candidate sourcing & matching",
        huntlo: "yes",
        competitor: "yes",
      },
      {
        feature: "Automated candidate outreach",
        huntlo: "yes",
        competitor: "yes",
      },
      {
        feature: "AI voice screening interviews",
        huntlo: "yes",
        competitor:
          "Not specifically documented in public materials; Qureos highlights video assessments",
      },
      {
        feature: "AI video interviews",
        huntlo: "yes",
        competitor: "Yes — described as video assessments",
      },
      {
        feature: "Interview scheduling automation",
        huntlo: "yes",
        competitor: "yes",
      },
      {
        feature: "ATS / HRIS integrations",
        huntlo: "yes",
        competitor: "Yes — broad integration list including major HRIS platforms",
      },
      {
        feature: "Regional hiring compliance features (e.g. GCC nationalization support)",
        huntlo: "Not a dedicated public feature; served through the general GCC solution",
        competitor:
          "Yes — built-in features for regional nationalization hiring requirements in some Gulf markets",
      },
      {
        feature: "Dedicated solutions per hiring team type",
        huntlo:
          "Yes — staffing agencies, recruitment firms, executive search, startups, enterprise, GCCs",
        competitor:
          "Not segmented by audience type in public materials; positioned as one platform for high-volume hiring generally",
      },
    ],
    bestFor: {
      huntlo: "Agentic AI Hiring Infrastructure",
      competitor: "Iris agentic recruiting (high-volume / GCC–MENA)",
    },
    chooseHuntlo: [
      "Want configurable Agentic AI Hiring Infrastructure tailored per hiring team type",
      "Need dedicated solutions for staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
      "Want recruiters kept in control of decisions across sourcing, screening, and interviews",
      "Need dedicated AI voice screening alongside AI video interviews",
    ],
    chooseCompetitor: [
      "Want a full-funnel agentic recruiting platform (Iris) built for high-volume hiring",
      "Need strong GCC/MENA specialization, including regional nationalization hiring support",
      "Prefer one platform positioned for high-volume hiring generally rather than audience-segmented solutions",
      "Want broad ATS/HRIS integrations as a primary evaluation criterion",
    ],
    whatIsHuntlo: {
      lead: "Huntlo AI is an Agentic AI Hiring Infrastructure built with dedicated, configurable workflows for different hiring teams, including staffing agencies, recruitment firms, executive search, startups, enterprise talent teams, and GCCs, all with recruiters kept in control of decisions.",
      bullets: [
        "AI candidate sourcing and matching",
        "Automated outreach and interview scheduling",
        "Dedicated AI voice screening and AI video interviews",
        "Integrates with existing ATS, HRIS, and recruitment CRM systems",
        "Dedicated GCC solution for Global Capability Centers and international hiring teams",
      ],
      philosophy: "Recruiters stay in control — AI assists across every hiring team type.",
      closing:
        "Built to fit into an existing recruiting tech stack rather than replace it outright.",
    },
    whatIsCompetitor: {
      lead: "Qureos, powered by its AI agent Iris, is an agentic recruiting platform built for high-volume hiring with strong specialization in GCC and MENA markets, including localized hiring compliance features.",
      bullets: [
        "Iris automates sourcing, screening, outreach, and interview scheduling across many channels",
        "Video assessments and automated candidate shortlisting",
        "Broad ATS/HRIS integrations (including major platforms such as SAP SuccessFactors, Workday, and Oracle, per public materials)",
        "Built-in features aimed at supporting nationalization hiring requirements in some Gulf markets",
      ],
      closing:
        "A substantial, well-reviewed full-funnel competitor — verify regional compliance claims against Qureos's current site before treating them as settled, especially for GCC/MENA buyers.",
    },
    featureComparison: [
      {
        capability: "Primary focus",
        huntlo:
          "Configurable agentic hiring infrastructure tailored per hiring team type, with recruiters kept in control",
        competitor:
          "Full-funnel agentic recruiting platform (Iris), built for high-volume hiring with strong GCC/MENA specialization",
      },
      {
        capability: "AI candidate sourcing & matching",
        huntlo: "Yes",
        competitor: "Yes",
      },
      {
        capability: "Automated candidate outreach",
        huntlo: "Yes",
        competitor: "Yes",
      },
      {
        capability: "AI voice screening interviews",
        huntlo: "Yes",
        competitor:
          "Not specifically documented in public materials; Qureos highlights video assessments",
      },
      {
        capability: "AI video interviews",
        huntlo: "Yes",
        competitor: "Yes — described as video assessments",
      },
      {
        capability: "Interview scheduling automation",
        huntlo: "Yes",
        competitor: "Yes",
      },
      {
        capability: "ATS / HRIS integrations",
        huntlo: "Yes",
        competitor: "Yes — broad integration list including major HRIS platforms",
      },
      {
        capability: "Regional hiring compliance features (e.g. GCC nationalization support)",
        huntlo: "Not a dedicated public feature; served through the general GCC solution",
        competitor:
          "Yes — built-in features for regional nationalization hiring requirements in some Gulf markets",
      },
      {
        capability: "Dedicated solutions per hiring team type",
        huntlo:
          "Yes — staffing agencies, recruitment firms, executive search, startups, enterprise, GCCs",
        competitor:
          "Not segmented by audience type in public materials; positioned as one platform for high-volume hiring generally",
      },
    ],
    biggestDifference:
      "Qureos is a broad, full-funnel agentic platform (Iris) with strong GCC/MENA specialization. Huntlo AI is Agentic AI Hiring Infrastructure differentiated by audience-specific configuration (dedicated workflows per hiring-team type) and recruiter-in-control framing — not by claiming Qureos lacks core funnel functionality.",
    workflowHuntlo: [
      "Source & match",
      "Automated outreach",
      "AI voice / video screen",
      "Recruiter review & decision",
      "Schedule & coordinate",
      "ATS / HRIS handoff",
    ],
    workflowCompetitor: [
      "Iris sourcing & matching",
      "Automated outreach",
      "Video assessments / shortlisting",
      "Interview scheduling",
      "ATS / HRIS sync",
    ],
    workflowNote:
      "Teams that want high-volume agentic recruiting with deep GCC/MENA compliance specialization may prefer Qureos. Teams that want configurable Agentic AI Hiring Infrastructure with dedicated solutions per hiring-team type and recruiters kept in control may prefer Huntlo AI. Have product owners sign off on the GCC/compliance row before treating it as settled.",
    useCases: [
      { useCase: "High-volume agentic recruiting (Iris)", recommended: "Qureos" },
      { useCase: "GCC/MENA nationalization compliance features", recommended: "Qureos" },
      { useCase: "Audience-specific hiring workflows", recommended: "Huntlo" },
      { useCase: "AI voice screening interviews", recommended: "Huntlo" },
      { useCase: "Staffing / recruitment firms / executive search", recommended: "Huntlo" },
      { useCase: "GCC / Global Capability Centers", recommended: "Both" },
      { useCase: "AI sourcing, outreach & scheduling", recommended: "Both" },
      { useCase: "ATS / HRIS integrations", recommended: "Both" },
    ],
    prosHuntlo: [
      "Configurable Agentic AI Hiring Infrastructure per hiring team type",
      "Recruiters kept in control of decisions",
      "Dedicated AI voice screening and AI video interviews",
      "Dedicated GCC solution alongside staffing, executive search, startups, and enterprise",
    ],
    considerationHuntlo:
      "Does not publicly position dedicated regional nationalization compliance features the way Qureos does — GCC coverage is through Huntlo's general GCC solution; verify with product owners before implying parity or gaps.",
    prosCompetitor: [
      "Full-funnel Iris platform for high-volume hiring",
      "Strong GCC/MENA specialization including regional compliance features in public materials",
      "Broad ATS/HRIS integration approach",
      "Video assessments and automated shortlisting",
    ],
    considerationCompetitor:
      "Not segmented by hiring-team type in public materials. AI voice screening distinct from video assessments is not specifically documented — confirm current capabilities directly with Qureos.",
    faq: [
      {
        question: "What is the difference between Huntlo AI and Qureos?",
        answer:
          "Qureos, powered by its AI agent Iris, is an agentic recruiting platform built for high-volume hiring with strong specialization in GCC and MENA markets, including localized hiring compliance features. Huntlo AI is an Agentic AI Hiring Infrastructure built with dedicated, configurable workflows for different hiring teams, including staffing agencies, recruitment firms, executive search, startups, enterprise talent teams, and GCCs, all with recruiters kept in control of decisions.",
      },
      {
        question: "Does Qureos offer AI voice and video interview screening like Huntlo AI?",
        answer:
          "Qureos's public materials describe video assessments and automated candidate shortlisting as part of its Iris platform. Huntlo AI includes dedicated AI voice screening and AI video interviews as a core part of its hiring workflow, alongside sourcing, outreach, and recruiter coordination.",
      },
      {
        question: "Is Qureos or Huntlo AI better for hiring in the GCC or MENA region?",
        answer:
          "Qureos has an established focus on GCC and MENA hiring, including features aimed at supporting nationalization hiring requirements in some Gulf markets. Huntlo AI also serves Global Capability Centers and international hiring teams through its own dedicated GCC solution, with the same recruiter-in-control approach it applies across every hiring team type.",
      },
      {
        question: "Can Huntlo AI integrate with the same ATS and HRIS systems as Qureos?",
        answer:
          "Yes. Huntlo AI is built to integrate with existing ATS, HRIS, and recruitment CRM systems, similar in principle to Qureos's broad integration approach, so teams evaluating either platform can expect it to fit into an existing recruiting tech stack rather than replace it outright.",
      },
    ],
    finalVerdict: [
      "Qureos is a substantial full-funnel Iris competitor with real GCC/MENA depth — treat it as a peer, not a legacy tool.",
      "Huntlo AI differentiates on audience-specific Agentic AI Hiring Infrastructure and recruiter-in-control workflows across staffing, executive search, startups, enterprise, and GCCs.",
      "Verify regional compliance claims and voice vs video assessment details against current product materials before launch.",
    ],
  }),
];

export const DETAILED_COMPARISON_PAGES = [
  ...LEGACY_COMPARISON_PAGES,
  ...EXTENDED_COMPARISON_PAGES,
];

export function detailedComparisonBySlug(slug: string): DetailedComparisonPage | undefined {
  return DETAILED_COMPARISON_PAGES.find((c) => c.slug === slug.trim());
}

export const DETAILED_COMPARISON_SLUGS = DETAILED_COMPARISON_PAGES.map((c) => c.slug);
