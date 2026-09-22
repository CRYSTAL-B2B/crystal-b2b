import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/inter-tight";
// Технические подписи: JetBrains Mono. Моноширинный, как и прежний IBM Plex
// Mono - номера и метки остаются выровненными, - но с крупной высотой строчных
// и потому разборчивее в мелком кегле. Кириллический сабсет, вес 400: другие
// начертания этому тексту не нужны.
import "@fontsource/jetbrains-mono/cyrillic-400.css";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { LeadProvider } from "@/components/contact/LeadProvider";

const siteUrl = getSiteUrl();
const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  title: "Даниил Чекулаев - B2B-маркетинг от спроса до выручки",
  description: "Строю измеримые B2B-маркетинговые системы по всей России: стратегия, лидогенерация, CRM, аналитика и AI-автоматизация. Более 11 лет опыта.",
  applicationName: "Даниил Чекулаев - B2B-маркетинг",
  authors: [{ name: "Даниил Чекулаев" }],
  creator: "Даниил Чекулаев",
  category: "marketing",
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    ...(siteUrl ? { url: "/" } : {}),
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

export const viewport: Viewport = {
  // Цвет интерфейса браузера под фон сайта (--ink из globals.css). Реально
  // применяет его Chrome на Android - и только когда у пользователя светлая
  // системная тема: с тёмной он и так рисует тёмную панель. Safari 26 тег
  // игнорирует и берёт цвет из контента наверху экрана, а тот и так тёмный.
  themeColor: "#050506",
  // То же, что `color-scheme: dark` в globals.css, но доезжает до браузера
  // раньше стилей: Chrome на Android по нему сразу отказывается от Auto Dark
  // Theme, не пытается затемнять уже тёмную страницу и не даёт вспышки.
  colorScheme: "dark",
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
        {/* Окна записи и заявки - по одному на страницу, кнопок к ним много. */}
        <BookingProvider>
          <LeadProvider>{children}</LeadProvider>
        </BookingProvider>
      </body>
    </html>
  );
}
