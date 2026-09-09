import { offerCopy, offerTiers } from "@/data/offer";
import { leadCopy } from "@/data/lead";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Arrow } from "@/components/ui/Arrow";
import { LeadButton } from "@/components/contact/LeadButton";

/** Формат без состава работ на странице не появляется - см. src/data/offer.ts. */
export function Offer() {
  if (offerTiers.length === 0) return null;

  return (
    <section className="offer-section" id="offer" aria-labelledby="offer-title">
      <div className="container">
        <SectionLabel index="03">Форматы работы</SectionLabel>
        <div className="offer-intro">
          <h2 id="offer-title">{offerCopy.title}</h2>
          <p>{offerCopy.lede}</p>
        </div>
        <div className="offer-grid">
          {offerTiers.map((tier, index) => (
            <article className="offer-card" key={tier.id}>
              <span>0{index + 1}</span>
              <h3>{tier.name}</h3>
              <p className="offer-audience">{tier.audience}</p>
              <ul className="offer-includes">
                {tier.includes.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="offer-meta">{tier.timeline}</p>
              <p className="offer-price">{tier.price}</p>
            </article>
          ))}
        </div>
        <div className="offer-footer">
          <p className="offer-disclaimer">{offerCopy.disclaimer}</p>
          <LeadButton className="button button-primary" placement="offer">
            {leadCopy.action} <Arrow />
          </LeadButton>
        </div>
      </div>
    </section>
  );
}
