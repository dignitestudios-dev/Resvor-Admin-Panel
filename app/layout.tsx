import type { Metadata } from "next";
import "./globals.css";
import "./nprogress.css";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { Providers } from "@/components/providers";
import { ProgressBar } from "@/components/progress-bar";
import { ConnectionStatus } from "@/components/connection-status";

export const metadata: Metadata = {
  title: "Resvor — Admin Panel",
  description: "Resvor platform administration dashboard for managing promoters & lounges, users, workforce, events and payments.",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ProgressBar />
        <ConnectionStatus />
        <Providers>
          <SidebarConfigProvider>{children}</SidebarConfigProvider>
        </Providers>
      </body>
    </html>
  );
}
