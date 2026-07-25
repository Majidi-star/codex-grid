import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/tailadmin/context/SidebarContext";
import { ThemeProvider } from "@/components/tailadmin/context/ThemeContext";
import TailadminLayout from "@/components/tailadmin/layout/TailadminLayout";
import { getActiveSprint } from "@/lib/sprint";
import { getDayNumber, getWeekNumber, getBlockNumber } from "@/lib/date";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sprint OS",
  description: "AI-powered operating system for sprints",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sprint = await getActiveSprint();
  let dayNumber = 1;
  let weekNumber = 1;
  let blockNumber = 1;

  if (sprint) {
    dayNumber = getDayNumber(sprint.startDate);
    weekNumber = getWeekNumber(dayNumber);
    blockNumber = getBlockNumber(weekNumber);
  }

  return (
    <html lang="en">
      <body className={`${outfit.variable} font-outfit antialiased`}>
        <ThemeProvider>
          <SidebarProvider>
            <TailadminLayout 
              currentDayNumber={dayNumber} 
              currentWeekNumber={weekNumber} 
              currentBlockNumber={blockNumber}
            >
              {children}
            </TailadminLayout>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
