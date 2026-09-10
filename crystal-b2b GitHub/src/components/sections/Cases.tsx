"use client";

import { useRef, useState } from "react";
import { cases } from "@/data/site";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Arrow } from "@/components/ui/Arrow";
import { CaseVisual } from "@/components/sections/CaseVisual";
import { ArtifactButton } from "@/components/cases/ArtifactButton";
import { LeadButton } from "@/components/contact/LeadButton";
import { leadCopy } from "@/data/lead";
import { trackEvent } from "@/lib/analytics";
import type { CaseStudy } from "@/data/site";
import { sectionNumber } from "@/data/section-numbers";

function renderResult(result: string, resultLink: CaseStudy["resultLink"]) {
  if (!resultLink || !result.includes(resultLink.text)) return result;
  const [before, after] = result.split(resultLink.text);
  return (
    <>
      {before}
      <a href={resultLink.href} target="_blank" rel="noopener noreferrer">{resultLink.text}</a>
      {after}
    </>
  );
}

const caseFilters = [
  { id: "all", label: "Все" },
  { id: "ai-automation", label: "AI-автоматизации" },
] as const;

type CaseFilter = (typeof caseFilters)[number]["id"];

/**
 * Кейсы.
 *
 * Отделены от метрик (см. Results.tsx): по новому порядку страницы они стоят
 * после опыта, а метрики - в начале. Компонент клиентский из-за фильтра и
 * отметки о первом раскрытии карточки, которая уходит в аналитику.
 */
export function Cases() {
  const viewed = useRef(new Set<string>());
  const [filter, setFilter] = useState<CaseFilter>("all");
  const visibleCases = filter === "all" ? cases : cases.filter((caseStudy) => caseStudy.evidence);

  return (
    <section className="cases-section" id="cases" aria-labelledby="cases-title">
      <div className="container">
        <div className="cases-heading">
          <SectionLabel index={sectionNumber("cases")}>Кейсы</SectionLabel>
          <h2 id="cases-title">Измеримый результат создают не инструменты,<br />а точные системные изменения.</h2>
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
                <span className="case-title"><small>{caseStudy.category}</small>{" "}<b>{caseStudy.company}</b></span>
                <span className="case-preview">
                  {(caseStudy.preview ?? [caseStudy.results[0]]).map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                <span className="case-toggle"><i>Открыть</i><Arrow /></span>
              </summary>
              <div className={caseStudy.evidence ? "case-body case-body-evidence" : "case-body"}>
                <div><small>{caseStudy.evidence ? "Проект" : "Проблема"}</small><p>{caseStudy.problem}</p></div>
                <div><small>{caseStudy.evidence ? "Мой вклад" : "Система"}</small><p>{caseStudy.system}</p></div>
                <div className="case-results"><small>Результат</small>{caseStudy.results.map((result) => <p key={result}>{renderResult(result, caseStudy.resultLink)}</p>)}</div>
                {caseStudy.evidence ? (
                  <div className="case-evidence"><small>Evidence</small>{caseStudy.evidence.map((item) => <p key={item}>{item}</p>)}</div>
                ) : null}
                {caseStudy.visual ? (
                  <CaseVisual visual={caseStudy.visual} company={caseStudy.company} />
                ) : null}
                <div className="case-actions">
                  <LeadButton
                    className="button button-primary case-cta"
                    placement="case"
                    caseId={caseStudy.id}
                  >
                    {leadCopy.cta} <Arrow />
                  </LeadButton>
                  {caseStudy.artifact ? (
                    <ArtifactButton
                      artifact={caseStudy.artifact}
                      company={caseStudy.company}
                      caseId={caseStudy.id}
                    />
                  ) : null}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
