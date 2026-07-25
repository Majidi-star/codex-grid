"use client";
import React, { createContext, useContext } from "react";

const ArchiveModeContext = createContext<boolean>(false);

export function ArchiveModeProvider({
  children,
  value
}: {
  children: React.ReactNode;
  value: boolean;
}) {
  return (
    <ArchiveModeContext.Provider value={value}>
      {children}
    </ArchiveModeContext.Provider>
  );
}

export function useArchiveMode() {
  return useContext(ArchiveModeContext);
}
