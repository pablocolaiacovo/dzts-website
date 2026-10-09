export function buildWhatsAppUrl(number: string, message?: string | null): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
