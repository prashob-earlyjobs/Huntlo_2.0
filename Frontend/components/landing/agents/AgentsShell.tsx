import type { ReactNode } from "react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

type AgentsShellProps = {
  children: ReactNode;
  aiAskPrompt?: string;
  aiAskTopic?: string;
};

export function AgentsShell({ children, aiAskPrompt, aiAskTopic }: AgentsShellProps) {
  return (
    <div className="landing-page min-h-screen bg-[#f8fafc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>{children}</main>
      <LandingFooter aiAskPrompt={aiAskPrompt} aiAskTopic={aiAskTopic} />
    </div>
  );
}
