import Image from "next/image";
import { experience } from "@/data/site";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { hasPortrait, portrait } from "@/lib/portrait";
import { sectionNumber } from "@/data/section-numbers";

/** Опыт. Отделён от компетенций и принципов - см. Competencies.tsx. */
export function Experience() {
  const showPortrait = hasPortrait();

  return (
    <section className="experience-section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionLabel index={sectionNumber("experience")}>Опыт</SectionLabel>
        <div className="experience-layout">
          <div className="experience-sticky">
            {showPortrait ? (
              <Image
                className="experience-portrait"
                src={portrait.src}
                width={portrait.width}
                height={portrait.height}
                alt={portrait.alt}
                loading="lazy"
              />
            ) : null}
            <p className="experience-number">11+</p>
            <h2 id="experience-title">лет в маркетинге сложных продуктов и B2B.</h2>
          </div>
          <ol className="experience-list">
            {experience.map((item) => (
              <li key={`${item.years}-${item.company}`}>
                <p className="experience-years">{item.years}</p>
                <div><h3>{item.company}</h3><p className="experience-role">{item.role}</p><p>{item.focus}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
