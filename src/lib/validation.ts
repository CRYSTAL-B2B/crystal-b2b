export type LeadPayload = {
  name: string;
  contact: string;
  task?: string;
  company?: string;
  turnstileToken: string;
  qualifiers: string[];
};

export type FieldErrors = Partial<Record<keyof LeadPayload, string>>;

const clean = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

const cleanQualifiers = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];

const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;
const phoneDigitCount = (value: string) => value.replace(/\D/g, "").length;

export function validateLead(input: unknown): {
  data?: LeadPayload;
  errors: FieldErrors;
} {
  const source = typeof input === "object" && input !== null ? input as Record<string, unknown> : {};
  const data: LeadPayload = {
    name: clean(source.name),
    contact: clean(source.contact),
    task: clean(source.task),
    company: clean(source.company),
    turnstileToken: clean(source.turnstileToken),
    qualifiers: cleanQualifiers(source.qualifiers),
  };
  const errors: FieldErrors = {};

  if (data.name.length < 2) errors.name = "Укажите имя - минимум 2 символа.";
  if (data.name.length > 80) errors.name = "Имя не должно быть длиннее 80 символов.";
  if (!data.contact) {
    errors.contact = "Укажите номер телефона.";
  } else if (!PHONE_PATTERN.test(data.contact) || phoneDigitCount(data.contact) < 10 || phoneDigitCount(data.contact) > 15) {
    errors.contact = "Введите корректный номер телефона.";
  }
  if ((data.task?.length ?? 0) > 2000) errors.task = "Описание задачи не должно быть длиннее 2000 символов.";
  if (!data.turnstileToken) errors.turnstileToken = "Обновите страницу и попробуйте снова.";

  return Object.keys(errors).length > 0 ? { errors } : { data, errors };
}
