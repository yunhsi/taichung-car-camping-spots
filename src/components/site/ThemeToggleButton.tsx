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

function useThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme, // 主題變化時通知 React
    getCurrentTheme,  // 取得瀏覽器目前的主題
    () => "light",    // 伺服器讀不到瀏覽器主題，先回傳 light
  );
  const isDark = theme === "dark";
  const modeLabel = isDark ? "淺色模式" : "深色模式";

  function toggleTheme() {
    const nextTheme: Theme = getCurrentTheme() === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    saveTheme(nextTheme);
  }

  return { isDark, label: `切換為${modeLabel}`, toggleTheme };
}

interface ThemeIconProps {
  isDark: boolean;
}

function ThemeIcon({ isDark }: ThemeIconProps) {
  return isDark ? (
    <Sun
      aria-hidden="true"
      strokeWidth="1.8"
      className="size-5 text-primary"
    />
  ) : (
    <Moon
      aria-hidden="true"
      strokeWidth="1.8"
      className="size-5 text-primary"
    />
  );
}

export function ThemeToggleButton() {
  const { isDark, label, toggleTheme } = useThemeToggle();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label={label}
          />
        }
      >
        <ThemeIcon isDark={isDark} />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="hidden md:block">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
