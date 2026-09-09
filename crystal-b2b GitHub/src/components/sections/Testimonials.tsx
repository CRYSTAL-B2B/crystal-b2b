import { testimonials, testimonialsCopy } from "@/data/testimonials";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionNumber } from "@/data/section-numbers";

/** Нет согласованных отзывов - нет и секции: заглушкам в проде не место. */
export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials-section" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <SectionLabel index={sectionNumber("testimonials")}>Отзывы</SectionLabel>
        <h2 id="testimonials-title" className="testimonials-title">{testimonialsCopy.title}</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.id}>
              <blockquote>{testimonial.text}</blockquote>
              <footer>
                <p className="testimonial-author">{testimonial.author}</p>
                <p className="testimonial-role">{testimonial.role}, {testimonial.company}</p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
