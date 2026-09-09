import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionNumber } from "@/data/section-numbers";

export function EconomicThesis() {
  return (
    <section className="economic-thesis" aria-labelledby="economic-title">
      <div className="container">
        <SectionLabel index={sectionNumber("economics")}>Экономический тезис</SectionLabel>
        <div className="economic-lines" id="economic-title">
          <p>Не обязательно закупать больше трафика.</p>
          <p>Можно получать больше результата <em>из того, который уже есть.</em></p>
          <p>Дополнительная прибыль - <em>результат управления системой.</em></p>
        </div>
      </div>
    </section>
  );
}
