"use client";

import { useRef, useState } from "react";
import { cases, metrics } from "@/data/site";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Arrow } from "@/components/ui/Arrow";
import { trackEvent } from "@/lib/analytics";

const caseFilters = [
  { id: "all", label: "Все" },
  { id: "ai-automation", label: "AI-автоматизации" },
] as const;

type CaseFilter = (typeof caseFilters)[number]["id"];

export function Proof() {
  const viewed = useRef(new Set<string>());
  const [filter, setFilter] = useState<CaseFilter>("all");
  const visibleCases = filter === "all" ? cases : cases.filter((caseStudy) => caseStudy.evidence);

  return (
    <>
      <section className="metrics-section" id="results" aria-labelledby="results-title">
        <div className="container">
          <SectionLabel index="06">Подтверждённые результаты</SectionLabel>
          <div className="proof-intro">
            <h2 id="results-title">Всё это имеет смысл только тогда, когда влияет на рост бизнеса.</h2>
            <p>Подтверждённые результаты из разных проектов - без смешивания контекста.</p>
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

      <section className="cases-section" id="cases" aria-labelledby="cases-title">
        <div className="container">
          <div className="cases-heading">
            <SectionLabel index="07">Кейсы</SectionLabel>
            <h2 id="cases-title">Не отдельные инструменты. Изменения в системе.</h2>
          </div>
          <div className="case-filters" role="group" aria-label="Фильтр кейсов по категории">
            {caseFilters.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="case-list">
            {visibleCases.map((caseStudy) => (
              <details
                className="case-row"
                key={caseStudy.id}
                onToggle={(event) => {
                  if (event.currentTarget.open && !viewed.current.has(caseStudy.id)) {
                    viewed.current.add(caseStudy.id);
                    trackEvent("case_view", { case_id: caseStudy.id });
                  }
                }}
              >
                <summary>
                  <span className="case-index">{caseStudy.index}</span>
                  <span className="case-title"><small>{caseStudy.category}</small><b>{caseStudy.company}</b></span>
                  <span className="case-preview">{caseStudy.results[0]}</span>
                  <span className="case-toggle"><i>Открыть</i><Arrow /></span>
                </summary>
                <div className={caseStudy.evidence ? "case-body case-body-evidence" : "case-body"}>
                  <div><small>{caseStudy.evidence ? "Проект" : "Проблема"}</small><p>{caseStudy.problem}</p></div>
                  <div><small>{caseStudy.evidence ? "Мой вклад" : "Система"}</small><p>{caseStudy.system}</p></div>
                  <div className="case-results"><small>Результат</small>{caseStudy.results.map((result) => <p key={result}>{result}</p>)}</div>
                  {caseStudy.evidence ? (
                    <div className="case-evidence"><small>Evidence</small>{caseStudy.evidence.map((item) => <p key={item}>{item}</p>)}</div>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
