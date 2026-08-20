import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource-variable/inter-tight";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

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
      <body>
        {yandexMetrikaId ? (
          <>
            {/* Yandex.Metrika counter */}
            <Script id="yandex-metrika" strategy="afterInteractive">
              {`(function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${yandexMetrikaId}', 'ym');

              ym(${yandexMetrikaId}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
            </Script>
            <noscript>
              <div>
                <img src={`https://mc.yandex.ru/watch/${yandexMetrikaId}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
              </div>
            </noscript>
            {/* /Yandex.Metrika counter */}
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
