export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return null;

  try {
    return new URL(value);
  } catch {
    return null;
  }
}
