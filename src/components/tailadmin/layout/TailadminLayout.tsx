"use client";

import { useSidebar } from "@/components/tailadmin/context/SidebarContext";
import AppHeader from "@/components/tailadmin/layout/AppHeader";
import AppSidebar from "@/components/tailadmin/layout/AppSidebar";
import Backdrop from "@/components/tailadmin/layout/Backdrop";
import React from "react";
import { GridIcon, CalenderIcon, UserCircleIcon, PageIcon, PlugInIcon, ListIcon } from "@/components/tailadmin/icons/index";

export default function TailadminLayout({
  children,
  currentDayNumber,
  currentWeekNumber,
  currentBlockNumber
}: {
  children: React.ReactNode;
  currentDayNumber: number;
  currentWeekNumber: number;
  currentBlockNumber: number;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  const navItems = [
    { name: "Dashboard", icon: <GridIcon />, path: "/" },
    { name: "Today", icon: <CalenderIcon />, path: `/day/${currentDayNumber}` },
    { name: "Weekly Summaries", icon: <PageIcon />, path: `/week/${currentWeekNumber}/summary` },
    { name: "Six-Week Reviews", icon: <PageIcon />, path: `/block/${currentBlockNumber}` },
    { name: "Setup / New Sprint", icon: <PlugInIcon />, path: "/setup" },
    { name: "Codex Laws", icon: <ListIcon />, path: "/codex" },
    { name: "All Sprints", icon: <ListIcon />, path: "/sprints" },
  ];

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar navItems={navItems} othersItems={[]} />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-7xl md:p-6">{children}</div>
      </div>
    </div>
  );
}
