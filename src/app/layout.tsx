import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { APATransferInitializer } from "@/components/APATransferInitializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoalGetter - LEAP 99 Goal Tracking v3.25",
  description:
    "Track your S.M.A.R.T.e.r. goals in LEAP 99 · by Doc Kalodski",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <APATransferInitializer />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
