import type { Metadata } from "next";

import { GoToTopButton } from "@/components/site/GoToTopButton";
import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";

import "./globals.css";

const SITE_TITLE = "台中車泊景點";
const SITE_DESCRIPTION =
  "探索台中適合車泊的地點，規劃下一趟自在安心的車旅。";
const DEPLOYMENT_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;
const METADATA_BASE = new URL(
  DEPLOYMENT_URL
    ? DEPLOYMENT_URL.startsWith("http")
      ? DEPLOYMENT_URL
      : `https://${DEPLOYMENT_URL}`
    : "http://localhost:3000",
);

const THEME_SCRIPT = `
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
  metadataBase: METADATA_BASE,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_TITLE,
  openGraph: {
    type: "website",
    url: "/",
    locale: "zh_TW",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <ToastProvider>
            {children}
            <GoToTopButton />
          </ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
