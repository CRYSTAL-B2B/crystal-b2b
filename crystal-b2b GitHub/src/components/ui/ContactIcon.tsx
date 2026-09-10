export type ContactIconName = "telegram" | "email";

/**
 * Иконки каналов связи рядом с Telegram и почтой.
 *
 * Контурные и на currentColor - как Arrow: ссылки контактов приглушены и
 * подсвечиваются при наведении, иконка должна менять цвет вместе с текстом.
 * Декоративные: канал назван словом в самой ссылке, читалке иконка не нужна.
 */
export function ContactIcon({ name, className = "" }: { name: ContactIconName; className?: string }) {
  if (name === "telegram") {
    return (
      <svg className={className} viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.4 3.1 1.8 9.5l4.6 1.6 1.2 4.8 2.5-2.6 3.9 2.7z" />
        <path d="M6.4 11.1 18.4 3.1l-7.9 9.4" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.9" y="4.6" width="16.2" height="10.8" rx="1.6" />
      <path d="M2.6 5.6 10 10.9l7.4-5.3" />
    </svg>
  );
}
