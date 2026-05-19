"use client";

import * as React from "react";
import { ThemeProviderContext } from "@/contexts/theme-context";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark";
  storageKey?: string;
};

export function ThemeProvider({
  children,
  storageKey = "crea-caps-ui-theme",
  ...props
}: ThemeProviderProps) {
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    localStorage.setItem(storageKey, "dark");
  }, [storageKey]);

  const value = {
    theme: "dark" as const,
    setTheme: () => {
      /* Solo dark mode — sin cambio de tema. */
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
