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

/**
 * У расписания два адреса, и они не взаимозаменяемы:
 *   /appointments/schedules/...          - обычная страница, Google отдаёт её
 *                                          с X-Frame-Options: SAMEORIGIN,
 *                                          в iframe она не откроется;
 *   /calendar/appointments/schedules/... - встраиваемая версия, без запрета.
 *
 * Короткая ссылка calendar.app.google ведёт на первый вариант, поэтому в
 * переменную окружения нужен полный адрес. Путь дополняем сами: ошибиться
 * при вставке проще, чем заметить потом пустое окно.
 */
function toEmbedPath(url: URL): URL {
  if (url.pathname.startsWith("/appointments/schedules/")) {
    url.pathname = `/calendar${url.pathname}`;
  }
  return url;
}

export function getBookingUrls(): BookingUrls | null {
  if (!rawUrl) return null;

  try {
    const external = new URL(rawUrl);
    const embed = toEmbedPath(new URL(rawUrl));
    embed.searchParams.set("gv", "true");
    // Сам Google берёт язык из браузера. Сайт целиком на русском, поэтому
    // задаём явно: иначе посетитель с английской системой увидит английский
    // календарь посреди русской страницы.
    embed.searchParams.set("hl", "ru");
    return { embed: embed.toString(), external: external.toString() };
  } catch {
    // Кривой адрес не должен ронять страницу - блок просто не отрисуется.
    return null;
  }
}

export const bookingCopy = {
  action: "Определить курс",
  /** Подпись под кнопками формы - поясняет, что даёт вторая кнопка. */
  note: "Созвон - 30 минут, онлайн.",
  modalTitle: "Выберите удобное время",
  modalSubtitle: "30 минут · онлайн",
  external: "Открыть страницу записи",
  loading: "Загружаем календарь…",
  close: "Закрыть",
} as const;

/** Где именно нажали - уходит в аналитику вместе с событием. */
export type BookingPlacement = "hero" | "contact" | "header" | "menu";
