"use client";

import { MotionConfig } from "framer-motion";
import { ReactNode } from "react";
import { CaseNavigationProvider } from "@/components/case-navigation";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // reducedMotion="user" tells Framer Motion to respect the OS "prefers-reduced-motion" setting.
  return <MotionConfig reducedMotion="user"><CaseNavigationProvider>{children}</CaseNavigationProvider></MotionConfig>;
}
