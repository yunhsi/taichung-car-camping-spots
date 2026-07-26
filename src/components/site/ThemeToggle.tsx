"use client";

import { useSyncExternalStore } from "react";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function saveTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // Browsers may deny storage access; unexpected failures should still surface.
    if (!(error instanceof DOMException)) {
      throw error;
    }
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme, // 主題變化時通知 React
    getCurrentTheme,  // 取得瀏覽器目前的主題
    () => "light",    // 伺服器讀不到瀏覽器主題，先回傳 light
  );
  const isDark = theme === "dark";
  const label = isDark ? "切換為淺色模式" : "切換為深色模式";

  function toggleTheme() {
    const nextTheme: Theme = getCurrentTheme() === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    saveTheme(nextTheme);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="size-11 rounded-full border-primary/30 bg-primary-soft text-primary hover:border-primary/50 hover:bg-primary-soft/70"
          aria-label={label}
        >
          {isDark ? (
            <Sun
              aria-hidden="true"
              strokeWidth="1.8"
              className="size-5"
            />
          ) : (
            <Moon
              aria-hidden="true"
              strokeWidth="1.8"
              className="size-5"
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
