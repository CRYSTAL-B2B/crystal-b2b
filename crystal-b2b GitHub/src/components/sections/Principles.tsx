import { principles } from "@/data/site";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionNumber } from "@/data/section-numbers";

/** Принципы работы. Отделены от компетенций и опыта - см. Competencies.tsx. */
export function Principles() {
  return (
    <section className="philosophy-section" aria-labelledby="philosophy-title">
      <div className="container">
        <SectionLabel index={sectionNumber("principles")}>Принципы работы</SectionLabel>
        <h2 id="philosophy-title">
          Маркетинг должен отвечать не на вопрос «сколько было кликов»,
          <em>а на вопрос «какие изменения в бизнесе принесут дополнительную прибыль».</em>
        </h2>
        <div className="principles-grid">
          {principles.map((principle, index) => (
            <article key={principle.name}>
              <span>0{index + 1}</span>
              <h3>{principle.name}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
