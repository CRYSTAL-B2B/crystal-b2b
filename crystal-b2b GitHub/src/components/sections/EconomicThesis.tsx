import { SectionLabel } from "@/components/ui/SectionLabel";

export function EconomicThesis() {
  return (
    <section className="economic-thesis" aria-labelledby="economic-title">
      <div className="container">
        <SectionLabel index="04">Экономический тезис</SectionLabel>
        <div className="economic-lines" id="economic-title">
          <p>Не обязательно закупать больше трафика.</p>
          <p>Можно получать больше результата <em>из того, который уже есть.</em></p>
          <p>Дополнительная прибыль - <em>результат управления системой.</em></p>
        </div>
        <div className="economic-formula" aria-label="Формула роста">
          <span>ВХОД</span><i>≈</i><span>КОНТРОЛЬ</span><i>↑</i><span>ПОТЕРИ</span><i>↓</i><span>ЦЕННОСТЬ</span><i>↑</i>
        </div>
      </div>
    </section>
  );
}
