import { competencies } from "@/data/site";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionNumber } from "@/data/section-numbers";

/**
 * Карта компетенций.
 *
 * Раньше жила в компоненте Expertise вместе с опытом и принципами работы.
 * По новому порядку страницы между опытом и принципами стоят кейсы, поэтому
 * три секции разнесены по отдельным компонентам. Классы и разметка не
 * менялись: к ним привязаны стили и подсветка карточек.
 */
export function Competencies() {
  return (
    <section className="expertise-section" aria-labelledby="expertise-title">
      <div className="container">
        <SectionLabel index={sectionNumber("competencies")}>Карта компетенций</SectionLabel>
        <div className="expertise-intro">
          <h2 id="expertise-title">От исследования рынка до обратной связи по выручке.</h2>
          <p>Использую AI там, где он сокращает цикл, снижает ручную работу или улучшает качество решения.</p>
        </div>
        <div className="competency-grid">
          {competencies.map((group, index) => (
            <article key={group.name}>
              <p><span>0{index + 1}</span>{group.name}</p>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
