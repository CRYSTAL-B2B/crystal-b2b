import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { EditorialBridge } from "@/components/sections/EditorialBridge";
import { SystemProcesses } from "@/components/scenes/SystemProcesses";
import { ControlFlow } from "@/components/scenes/ControlFlow";
import { EconomicThesis } from "@/components/sections/EconomicThesis";
import { ConnectedSystem } from "@/components/scenes/ConnectedSystem";
import { Results } from "@/components/sections/Results";
import { Cases } from "@/components/sections/Cases";
import { Offer } from "@/components/sections/Offer";
import { Testimonials } from "@/components/sections/Testimonials";
import { Competencies } from "@/components/sections/Competencies";
import { Experience } from "@/components/sections/Experience";
import { Principles } from "@/components/sections/Principles";
import { Lighthouse } from "@/components/scenes/Lighthouse";
import { Contact } from "@/components/sections/Contact";
import { DesktopSmoothScroll } from "@/components/motion/DesktopSmoothScroll";
import { ScrollToHashOnLoad } from "@/components/motion/ScrollToHashOnLoad";
import { CardAura } from "@/components/motion/CardAura";
import { getSiteUrl } from "@/lib/site-url";
import { hasPortrait, portrait } from "@/lib/portrait";
import { sectionNumber } from "@/data/section-numbers";

export default function Home() {
  const siteUrl = getSiteUrl();
  // Ссылка на фотографию уходит в разметку Person, только если файл есть:
  // адрес на несуществующий портрет поисковик засчитает за битую ссылку.
  const portraitUrl = siteUrl && hasPortrait() ? new URL(portrait.src, siteUrl).toString() : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Даниил Чекулаев",
    jobTitle: "B2B-маркетолог и руководитель маркетинга",
    description: "Специалист по B2B-маркетинговым системам, CRM, лидогенерации, аналитике и автоматизации.",
    knowsAbout: ["B2B-маркетинг", "CRM-маркетинг", "Лидогенерация", "Маркетинговая аналитика", "Автоматизация маркетинга"],
    sameAs: ["https://t.me/DAmarketolog"],
    ...(siteUrl ? { url: siteUrl.toString() } : {}),
    ...(portraitUrl ? { image: portraitUrl } : {}),
  };

  return (
    <>
      <DesktopSmoothScroll />
      <ScrollToHashOnLoad />
      <CardAura />
      <a className="skip-link" href="#main">Перейти к содержанию</a>
      <Header />
      <main id="main">
        <Hero />
        {/* Порядок задан владельцем. Названные им блоки идут ровно так, как он
            перечислил; четыре неназванных (процессы, экономический тезис,
            связанная система, сигнал) стоят там, где к ним ведёт
            повествование: сцена процессов сразу за «Что такое система», тезис
            и связанная система - за «Управлением потоком», сигнал - перед
            контактом. Порядок обязан совпадать с SECTION_ORDER в
            src/data/section-numbers.ts, иначе поедут номера подписей. */}
        <EditorialBridge
          id="system"
          index={sectionNumber("system")}
          label="Что такое система"
          title={<>Система - это не набор инструментов. <br /><em>Это процессы, которые работают в синергии.</em></>}
          body={<>Исследование формирует решение. Стратегия задаёт направление. Маркетинг создаёт спрос. CRM управляет движением лида. Продажи превращают его в выручку. Аналитика возвращает данные обратно в систему.</>}
        />
        <SystemProcesses />
        <Results />
        <Offer />
        <Testimonials />
        <EditorialBridge
          index={sectionNumber("control")}
          label="Данные и контроль"
          title={<>Связать процессы недостаточно. <br /><em>Нужно видеть, что происходит между ними.</em></>}
          body={<>Каждый контакт, переход, реакция, потеря и сделка создают данные. Управляемость этим потоком позволяет извлекать больше результата из уже существующего спроса.</>}
          dark
        />
        <ControlFlow />
        <EconomicThesis />
        <ConnectedSystem />
        <Competencies />
        <Experience />
        <Cases />
        <Principles />
        <Lighthouse />
        <Contact />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </>
  );
}
