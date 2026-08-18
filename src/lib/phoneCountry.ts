// Ordered longest-prefix-first so multi-digit codes are matched before their
// single-digit overlaps (e.g. "375" before "7", "44" before a hypothetical "4").
const COUNTRY_CALLING_CODES: { code: string; flag: string }[] = [
  { code: "375", flag: "🇧🇾" },
  { code: "380", flag: "🇺🇦" },
  { code: "994", flag: "🇦🇿" },
  { code: "995", flag: "🇬🇪" },
  { code: "998", flag: "🇺🇿" },
  { code: "996", flag: "🇰🇬" },
  { code: "992", flag: "🇹🇯" },
  { code: "993", flag: "🇹🇲" },
  { code: "971", flag: "🇦🇪" },
  { code: "972", flag: "🇮🇱" },
  { code: "374", flag: "🇦🇲" },
  { code: "373", flag: "🇲🇩" },
  { code: "372", flag: "🇪🇪" },
  { code: "371", flag: "🇱🇻" },
  { code: "370", flag: "🇱🇹" },
  { code: "44", flag: "🇬🇧" },
  { code: "49", flag: "🇩🇪" },
  { code: "33", flag: "🇫🇷" },
  { code: "39", flag: "🇮🇹" },
  { code: "34", flag: "🇪🇸" },
  { code: "90", flag: "🇹🇷" },
  { code: "86", flag: "🇨🇳" },
  { code: "81", flag: "🇯🇵" },
  { code: "82", flag: "🇰🇷" },
  { code: "91", flag: "🇮🇳" },
  { code: "61", flag: "🇦🇺" },
  { code: "55", flag: "🇧🇷" },
  { code: "7", flag: "🇷🇺" },
  { code: "1", flag: "🇺🇸" },
];

export const DEFAULT_PHONE_FLAG = "🇷🇺";

export function detectCountryFlag(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return DEFAULT_PHONE_FLAG;

  const match = COUNTRY_CALLING_CODES.find(({ code }) => digits.startsWith(code));
  return match?.flag ?? DEFAULT_PHONE_FLAG;
}
