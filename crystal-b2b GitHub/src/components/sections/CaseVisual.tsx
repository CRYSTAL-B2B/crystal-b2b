import type { CaseVisual as CaseVisualData } from "@/data/site";

interface CaseVisualProps {
  visual: CaseVisualData;
  /** Компания кейса - уходит в скрытую подпись, чтобы метрика не читалась в отрыве. */
  company: string;
}

/**
 * Крупная метрика в раскрытой карточке кейса.
 *
 * Свёрстано текстом, а не SVG: цифры и подписи должны читаться скринридером
 * как обычный текст, тянуться по ширине и переживать смену типографической
 * шкалы - в SVG всё это пришлось бы эмулировать.
 */
export function CaseVisual({ visual, company }: CaseVisualProps) {
  return (
    <figure className="case-visual" data-mode={visual.mode}>
      <figcaption className="case-visual-caption">
        Ключевые цифры: {company}
      </figcaption>

      {visual.mode === "delta" ? (
        <div className="case-visual-rows">
          {visual.rows.map((row) => (
            <div className="case-visual-delta" key={row.caption}>
              <p className="case-visual-figures">
                <span className="case-visual-from">
                  <span className="case-visual-sr">было </span>
                  {row.from}
                </span>
                <span className="case-visual-arrow" aria-hidden="true">→</span>
                <span className="case-visual-to">
                  <span className="case-visual-sr">стало </span>
                  {row.to}
                </span>
              </p>
              <p className="case-visual-label">{row.caption}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="case-visual-rows">
          {visual.items.map((item) => (
            <div className="case-visual-scale" key={item.caption}>
              <p className="case-visual-figures">
                <span className="case-visual-to">{item.value}</span>
              </p>
              <p className="case-visual-label">{item.caption}</p>
            </div>
          ))}
        </div>
      )}

      {visual.note ? <p className="case-visual-note">{visual.note}</p> : null}
    </figure>
  );
}
