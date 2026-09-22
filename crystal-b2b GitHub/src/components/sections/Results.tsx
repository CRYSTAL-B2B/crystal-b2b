import { metrics } from "@/data/site";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionNumber } from "@/data/section-numbers";

/**
 * Подтверждённые результаты.
 *
 * Раньше метрики и кейсы жили в одном компоненте Proof и всегда шли парой.
 * По новому порядку страницы между ними стоят форматы работы, повествование о
 * системе, компетенции и опыт, поэтому секции разделены. Метрики состояния не
 * держат, так что это серверный компонент - в отличие от кейсов с фильтром.
 */
export function Results() {
  return (
    <section className="metrics-section" id="results" aria-labelledby="results-title">
      <div className="container">
        <SectionLabel index={sectionNumber("results")}>Подтверждённые результаты</SectionLabel>
        <div className="proof-intro">
          <h2 id="results-title">Точные данные превращают маркетинг в инструмент управления ростом бизнеса.</h2>
          <p>Видеть ситуацию целиком без искажений это возможность находить точки роста бизнеса.</p>
        </div>
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <article className={`metric metric-${index + 1}`} key={metric.id}>
              <p className="metric-company">{metric.company}</p>
              <p className="metric-value">{metric.value}</p>
              {metric.unit ? <p className="metric-unit">{metric.unit}</p> : null}
              <p className="metric-label">{metric.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
