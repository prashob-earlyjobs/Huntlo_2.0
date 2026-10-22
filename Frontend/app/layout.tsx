import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { GoogleAnalyticsRoute } from "@/components/analytics/GoogleAnalyticsRoute";
import { AuthProvider, RealtimeProvider } from "@/providers";
import { CookieBanner } from "@/components/cookie-banner/CookieBanner";
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
      <body className="flex min-h-full min-w-0 flex-col overflow-x-hidden">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KQE932R4J6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            var path = window.location.pathname || "/";
            var isBlog = path === "/blog" || path.indexOf("/blog/") === 0 || path === "/admin/blog" || path.indexOf("/admin/blog/") === 0;
            if (!isBlog) {
              gtag('config', 'G-KQE932R4J6');
            }
          `}
        </Script>
        <GoogleAnalyticsRoute />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RealtimeProvider>
              <TooltipProvider delay={200}>
                {children}
                <CookieBanner />
              </TooltipProvider>
            </RealtimeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
