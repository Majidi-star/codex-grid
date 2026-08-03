"use client";

import { useSidebar } from "@/components/tailadmin/context/SidebarContext";
import AppHeader from "@/components/tailadmin/layout/AppHeader";
import AppSidebar from "@/components/tailadmin/layout/AppSidebar";
import Backdrop from "@/components/tailadmin/layout/Backdrop";
import React, { useState, useEffect } from "react";
import { GridIcon, CalenderIcon, UserCircleIcon, PageIcon, PlugInIcon, ListIcon } from "@/components/tailadmin/icons/index";

import ChatSidebar from "@/components/chat/ChatSidebar";

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [isChatResizing, setIsChatResizing] = useState(false);
  const [isMobileChat, setIsMobileChat] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileChat(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  const navItems = [
    { name: "Dashboard", icon: <GridIcon />, path: "/" },
    { name: "Today", icon: <CalenderIcon />, path: `/day/${currentDayNumber}` },
    { name: "Weekly Summaries", icon: <PageIcon />, path: `/week/${currentWeekNumber}/summary` },
    { name: "12-Week Reviews", icon: <PageIcon />, path: `/block/${currentBlockNumber}` },
    { name: "Setup / New Sprint", icon: <PlugInIcon />, path: "/setup" },
    { name: "The Codex", icon: <ListIcon />, path: "/codex" },
    { name: "All Sprints", icon: <ListIcon />, path: "/sprints" },
  ];

  const othersItems = [
    { name: "AI Settings", icon: <UserCircleIcon />, path: "/settings" }
  ];

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar navItems={navItems} othersItems={othersItems} />
      <Backdrop />
      <div
        style={{ marginRight: isChatOpen && !isMobileChat ? `${chatWidth}px` : "0px" }}
        className={`flex-1 ${isChatResizing ? "" : "transition-all duration-300 ease-in-out"} ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-7xl md:p-6">{children}</div>
      </div>
      <ChatSidebar 
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        width={chatWidth}
        setWidth={setChatWidth}
        isResizing={isChatResizing}
        setIsResizing={setIsChatResizing}
      />
    </div>
  );
}
