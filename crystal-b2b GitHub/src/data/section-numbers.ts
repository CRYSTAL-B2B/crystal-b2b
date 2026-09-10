import { testimonials } from "@/data/testimonials";

/**
 * Сквозная нумерация подписей разделов.
 *
 * Номера не проставлены в компонентах руками намеренно. Секция отзывов
 * появляется и исчезает вместе с контентом (src/data/testimonials.ts), и при
 * ручной нумерации её публикация означала бы правку одиннадцати файлов -
 * пропустив хоть один, получаем дубль или дыру в счёте. Здесь номер считается
 * от порядка блоков на странице, поэтому счёт всегда идёт подряд.
 *
 * ВАЖНО: порядок в этом массиве обязан совпадать с порядком блоков в
 * src/app/page.tsx. Меняете порядок на странице - меняйте и здесь.
 */
const SECTION_ORDER = [
  "system",
  "processes",
  "results",
  "offer",
  "testimonials",
  "control",
  "flow",
  "economics",
  "connected",
  "competencies",
  "experience",
  "cases",
  "principles",
  "lighthouse",
  "contact",
] as const;

export type SectionKey = (typeof SECTION_ORDER)[number];

/** Блоки, которые сейчас реально попадают на страницу. */
const publishedSections = SECTION_ORDER.filter(
  (key) => key !== "testimonials" || testimonials.length > 0,
);

/** Номер подписи: «01», «02», … в порядке следования блоков. */
export function sectionNumber(key: SectionKey): string {
  const position = publishedSections.indexOf(key);
  // Ключа нет среди опубликованных - значит секция скрыта и подпись не
  // рендерится; пустая строка вместо номера безопаснее выдуманной цифры.
  if (position === -1) return "";
  return String(position + 1).padStart(2, "0");
}
