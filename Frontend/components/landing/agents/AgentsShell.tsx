import type { ReactNode } from "react";

import { Footer } from "@/components/huntlo/Footer";
import { Navbar } from "@/components/huntlo/Navbar";

type AgentsShellProps = {
  children: ReactNode;
  aiAskPrompt?: string;
  aiAskTopic?: string;
};

/** Shared chrome for /agents/* — same halo-home tokens as solutions/platform pages. */
export function AgentsShell({ children, aiAskPrompt, aiAskTopic }: AgentsShellProps) {
  return (
    <div id="top" className="halo-home">
      <Navbar />
      <main>{children}</main>
      <Footer aiAskPrompt={aiAskPrompt} aiAskTopic={aiAskTopic} />
    </div>
  );
}
