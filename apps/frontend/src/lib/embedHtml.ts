const UNSAFE_EMBED =
  /<(script|iframe|object|embed|base|meta|form|style|svg)\b|[\s/]on\w+\s*=|javascript:|&#/i;

export function safeEmbedHtml(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed || UNSAFE_EMBED.test(trimmed)) return null;
  return trimmed;
}
