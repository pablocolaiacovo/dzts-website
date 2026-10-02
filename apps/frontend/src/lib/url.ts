export function extractUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;

  const hrefMatch = trimmed.match(/href=["']([^"']*)["']/i);
  if (hrefMatch) {
    const href = hrefMatch[1].trim();
    return href || null;
  }

  const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  return urlMatch ? urlMatch[0] : null;
}
