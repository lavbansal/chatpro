"use client";

import { useEffect, useState, type FC } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

export const ThemeToggle: FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

  // The theme is unknown until after hydration, so render a placeholder on
  // the first pass to avoid a server/client mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <TooltipIconButton
      tooltip={isDark ? "Switch to light mode" : "Switch to dark mode"}
      variant="ghost"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </TooltipIconButton>
  );
};
