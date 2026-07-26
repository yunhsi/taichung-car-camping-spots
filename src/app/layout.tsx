import type { Metadata } from "next";

import { GoToTopButton } from "@/components/site/GoToTopButton";
import { TooltipProvider } from "@/components/ui/Tooltip";

import "./globals.css";

const themeScript = `
  try {
    const savedTheme = localStorage.getItem("theme");
    // 作業系統是否偏好深色模式
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle(
      "dark",
      savedTheme === "dark" || (!savedTheme && prefersDark),
    );
  } catch {
    document.documentElement.classList.toggle(
      "dark",
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
  }
`;

export const metadata: Metadata = {
  title: "台中車泊景點",
  description: "探索台中適合車泊的地點，規劃下一趟自在安心的車旅。",
  applicationName: "台中車泊景點",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant-TW"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          {children}
          <GoToTopButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
