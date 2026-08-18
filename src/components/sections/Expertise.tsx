import { competencies, experience, principles } from "@/data/site";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Expertise() {
  return (
    <>
      <section className="expertise-section" aria-labelledby="expertise-title">
        <div className="container">
          <SectionLabel index="08">Карта компетенций</SectionLabel>
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

      <section className="experience-section" id="experience" aria-labelledby="experience-title">
        <div className="container">
          <SectionLabel index="09">Опыт</SectionLabel>
          <div className="experience-layout">
            <div className="experience-sticky">
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

      <section className="philosophy-section" aria-labelledby="philosophy-title">
        <div className="container">
          <SectionLabel index="10">Принципы работы</SectionLabel>
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
    </>
  );
}
