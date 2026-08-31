/**
 * Запись на созвон через Google Appointment Schedule.
 *
 * Адрес расписания задаётся переменной окружения - как и остальные публичные
 * значения проекта (сайт статический, сервера нет, всё вшивается при сборке).
 * Пока переменная пуста, блок записи просто не появляется: лучше не показывать
 * кнопку вовсе, чем вести на пустой календарь.
 */
const rawUrl = process.env.NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL?.trim() ?? "";

export type BookingUrls = {
  /** Адрес для iframe: Google отдаёт встроенную версию страницы по gv=true. */
  embed: string;
  /** Обычная страница записи - для запасной ссылки в новой вкладке. */
  external: string;
};

export function getBookingUrls(): BookingUrls | null {
  if (!rawUrl) return null;

  try {
    const external = new URL(rawUrl);
    const embed = new URL(rawUrl);
    embed.searchParams.set("gv", "true");
    return { embed: embed.toString(), external: external.toString() };
  } catch {
    // Кривой адрес не должен ронять страницу - блок просто не отрисуется.
    return null;
  }
}

export const bookingCopy = {
  eyebrow: "Быстрый следующий шаг",
  action: "Определить курс",
  lead: "Выбрать время для созвона",
  meta: "30 минут · онлайн",
  modalTitle: "Выберите удобное время",
  modalSubtitle: "30 минут · онлайн",
  external: "Открыть страницу записи",
  loading: "Загружаем календарь…",
  close: "Закрыть",
  or: "или",
} as const;

/** Где именно нажали - уходит в аналитику вместе с событием. */
export type BookingPlacement = "hero" | "contact" | "header";
