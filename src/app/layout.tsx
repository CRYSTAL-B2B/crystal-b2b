import type { Metadata } from "next";
import "@fontsource-variable/inter-tight";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  title: "Даниил Чекулаев - B2B-маркетолог | Стратегия, CRM и лидогенерация",
  description: "Строю измеримые B2B-маркетинговые системы: стратегия, лидогенерация, CRM, аналитика и AI-автоматизация. Более 11 лет опыта.",
  applicationName: "Даниил Чекулаев - B2B-маркетинг",
  authors: [{ name: "Даниил Чекулаев" }],
  creator: "Даниил Чекулаев",
  category: "marketing",
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "Даниил Чекулаев - B2B-маркетинг от спроса до выручки",
    description: "Стратегия, лидогенерация, CRM, аналитика и автоматизация - в одной измеримой системе.",
    siteName: "Даниил Чекулаев",
  },
  twitter: {
    card: "summary_large_image",
    title: "Даниил Чекулаев - B2B-маркетинг от спроса до выручки",
    description: "Строю B2B-маркетинг как управляемую систему роста.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
