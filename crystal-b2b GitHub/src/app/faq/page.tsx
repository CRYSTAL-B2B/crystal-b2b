import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TypographySwitcher } from "@/components/ui/TypographySwitcher";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Arrow } from "@/components/ui/Arrow";
import { faqItems } from "@/data/faq";
import { getSiteUrl } from "@/lib/site-url";

const title = "Вопросы и ответы - Даниил Чекулаев";
const description = "Как проходит работа, сколько стоит, чем это отличается от агентства и как используется AI-автоматизация - частые вопросы перед началом сотрудничества.";

export const metadata: Metadata = {
  title,
  description,
  ...(getSiteUrl() ? { alternates: { canonical: "/faq" } } : {}),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    ...(getSiteUrl() ? { url: "/faq" } : {}),
    title,
    description,
    siteName: "Даниил Чекулаев",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function FaqPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <a className="skip-link" href="#main">Перейти к содержанию</a>
      <Header />
      <TypographySwitcher />
      <main id="main">
        <section className="cases-section faq-section" aria-labelledby="faq-title">
          <div className="container">
            <div className="cases-heading">
              <SectionLabel>Вопросы и ответы</SectionLabel>
              <h1 id="faq-title">Что обычно спрашивают перед началом работы.</h1>
            </div>
            <div className="case-list">
              {faqItems.map((item, index) => (
                <details className="case-row" key={item.id}>
                  <summary>
                    <span className="case-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="case-title"><b>{item.question}</b></span>
                    <span className="case-preview">{item.tag}</span>
                    <span className="case-toggle"><i>Открыть</i><Arrow /></span>
                  </summary>
                  <div className="case-body faq-body">
                    <div><p>{item.answer}</p></div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </>
  );
}
