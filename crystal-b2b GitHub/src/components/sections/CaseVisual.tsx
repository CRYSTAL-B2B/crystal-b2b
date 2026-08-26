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
  // Одиночные величины набраны тем же кеглем, что и пары «было → стало»:
  // цифры во всех кейсах должны выглядеть одинаково. Разделяет их не размер,
  // а вертикальная линия между рядами.
  const hasRows = Boolean(visual.rows?.length);

  return (
    <figure className="case-visual">
      <figcaption className="case-visual-caption">
        Ключевые цифры: {company}
      </figcaption>

      <div className="case-visual-body">
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
          <div className={hasRows ? "case-visual-rows case-visual-items" : "case-visual-rows"}>
            {visual.items.map((item) => (
              <div className="case-visual-scale" key={item.caption}>
                <p className="case-visual-figures">
                  <span className="case-visual-to">{item.value}</span>
                </p>
                <p className="case-visual-label">{item.caption}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {visual.note ? <p className="case-visual-note">{visual.note}</p> : null}
    </figure>
  );
}
