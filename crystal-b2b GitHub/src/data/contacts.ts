import type { ContactIconName } from "@/components/ui/ContactIcon";

export type ContactLink = {
  label: string;
  href: string;
  /** Какая иконка идёт перед подписью - см. ContactIcon.tsx. */
  icon: ContactIconName;
};

export const contactLinks: readonly ContactLink[] = [
  { label: "Telegram: @DAmarketolog", href: "https://t.me/DAmarketolog", icon: "telegram" },
  { label: "E-mail: daniil@smetika.pro", href: "mailto:daniil@smetika.pro", icon: "email" },
] as const;
