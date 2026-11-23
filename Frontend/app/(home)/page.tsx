import type { Metadata } from "next";

import { LegacyHuntloHomePage } from "@/components/huntlo/LegacyHuntloHomePage";

const title = "Huntlo — AI Voice Agents for Hiring, Onboarding & Retention";
const description =
  "Huntlo's AI voice agents call, qualify and follow up with candidates and employees, so no one is lost between conversations.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

/** Site homepage — formerly served at `/new`. */
export default function HomePage() {
  return <LegacyHuntloHomePage />;
}
