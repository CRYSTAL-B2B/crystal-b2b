import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { EditorialBridge } from "@/components/sections/EditorialBridge";
import { SystemProcesses } from "@/components/scenes/SystemProcesses";
import { ControlFlow } from "@/components/scenes/ControlFlow";
import { EconomicThesis } from "@/components/sections/EconomicThesis";
import { ConnectedSystem } from "@/components/scenes/ConnectedSystem";
import { Proof } from "@/components/sections/Proof";
import { Offer } from "@/components/sections/Offer";
import { Testimonials } from "@/components/sections/Testimonials";
import { Expertise } from "@/components/sections/Expertise";
import { Lighthouse } from "@/components/scenes/Lighthouse";
import { Contact } from "@/components/sections/Contact";
import { DesktopSmoothScroll } from "@/components/motion/DesktopSmoothScroll";
import { ScrollToHashOnLoad } from "@/components/motion/ScrollToHashOnLoad";
import { CardAura } from "@/components/motion/CardAura";
import { getSiteUrl } from "@/lib/site-url";
import { hasPortrait, portrait } from "@/lib/portrait";

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
        <EditorialBridge
          id="system"
          index="01"
          label="Что такое система"
          title={<>Система - это не набор инструментов. <br /><em>Это процессы, которые работают в синергии.</em></>}
          body={<>Исследование формирует решение. Стратегия задаёт направление. Маркетинг создаёт спрос. CRM управляет движением лида. Продажи превращают его в выручку. Аналитика возвращает данные обратно в систему.</>}
        />
        <SystemProcesses />
        <EditorialBridge
          index="02"
          label="Данные и контроль"
          title={<>Связать процессы недостаточно. <br /><em>Нужно видеть, что происходит между ними.</em></>}
          body={<>Каждый контакт, переход, реакция, потеря и сделка создают данные. Управляемость этим потоком позволяет извлекать больше результата из уже существующего спроса.</>}
          dark
        />
        <ControlFlow />
        <EconomicThesis />
        <EditorialBridge
          index="03"
          label="Видеть систему целиком"
          title={<>Чем сложнее система, <br /><em>тем важнее видеть её целиком.</em></>}
          body={<>Изменение одного процесса меняет нагрузку, данные и результат следующих. Поэтому оптимизировать маркетинг, CRM, продажи и аналитику в полной изоляции друг от друга недостаточно.</>}
        />
        <ConnectedSystem />
        <Proof />
        <Offer />
        <Testimonials />
        <Expertise />
        <Lighthouse />
        <Contact />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </>
  );
}
