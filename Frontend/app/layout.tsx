import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider, RealtimeProvider } from "@/providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Huntlo — Recruiting workspace",
    template: "%s · Huntlo",
  },
  description:
    "Huntlo helps recruiting teams source candidates, run outreach, screen applicants, and schedule interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RealtimeProvider>
              <TooltipProvider delay={200}>{children}</TooltipProvider>
            </RealtimeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
