"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { LeadData } from "@/lib/types";

interface LeadContextType {
  lead: LeadData | null;
  isVerified: boolean;
  setLead: (lead: LeadData) => void;
  clearLead: () => void;
  showGatekeeper: boolean;
  setShowGatekeeper: (show: boolean) => void;
  pendingTool: string | null;
  setPendingTool: (tool: string | null) => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [lead, setLeadState] = useState<LeadData | null>(null);
  const [showGatekeeper, setShowGatekeeper] = useState(false);
  const [pendingTool, setPendingTool] = useState<string | null>(null);

  const isVerified = !!lead?.verifiedAt;

  const setLead = useCallback((data: LeadData) => {
    setLeadState(data);
  }, []);

  const clearLead = useCallback(() => {
    setLeadState(null);
  }, []);

  return (
    <LeadContext.Provider
      value={{
        lead,
        isVerified,
        setLead,
        clearLead,
        showGatekeeper,
        setShowGatekeeper,
        pendingTool,
        setPendingTool,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

export function useLead() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error("useLead must be used within a LeadProvider");
  }
  return context;
}
