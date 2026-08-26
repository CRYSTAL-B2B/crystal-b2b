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
  // Одиночные величины мельче пар «было → стало», но только когда пары есть:
  // иначе блоку не с чем создавать иерархию и величины остаются крупными.
  const itemsAreSecondary = Boolean(visual.rows?.length);

  return (
    <figure className="case-visual">
      <figcaption className="case-visual-caption">
        Ключевые цифры: {company}
      </figcaption>

      {visual.rows?.length ? (
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
      ) : null}

      {visual.items?.length ? (
        <div className={itemsAreSecondary ? "case-visual-rows case-visual-items" : "case-visual-rows"}>
          {visual.items.map((item) => (
            <div className="case-visual-scale" key={item.caption}>
              <p className={itemsAreSecondary ? "case-visual-figures case-visual-figures-sm" : "case-visual-figures"}>
                <span className="case-visual-to">{item.value}</span>
              </p>
              <p className="case-visual-label">{item.caption}</p>
            </div>
          ))}
        </div>
      ) : null}

      {visual.note ? <p className="case-visual-note">{visual.note}</p> : null}
    </figure>
  );
}
