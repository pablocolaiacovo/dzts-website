const MAX_DESCRIPTION_LENGTH = 155;

export interface PropertySeoInput {
  title?: string | null;
  subtitle?: string | null;
  operationType?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  rooms?: number | null;
  price?: number | null;
  currency?: string | null;
}

/** Converts an all-caps string to sentence case; leaves mixed-case strings untouched. */
export function normalizeTitle(title: string): string {
  const trimmed = title.trim();
  const hasLetters = /[a-zA-ZÀ-ÿ]/.test(trimmed);
  const isAllUpper = hasLetters && trimmed === trimmed.toUpperCase();
  if (!isAllUpper) return trimmed;

  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function operationLabel(operationType?: string | null): string | null {
  if (operationType === "venta" || operationType === "alquiler") {
    return operationType;
  }
  return null;
}

/** Location suffix ("en <neighborhood>, <city>"), skipping parts already present in the title. */
function buildLocationSuffix(
  titleLower: string,
  neighborhood?: string | null,
  city?: string | null,
): string {
  const parts = [neighborhood, city].filter(
    (part): part is string =>
      !!part && !titleLower.includes(part.toLowerCase()),
  );
  return parts.length > 0 ? `en ${parts.join(", ")}` : "";
}

/** Builds "<title> en <venta|alquiler> en <neighborhood>, <city>", appending only known parts. */
export function buildPropertyTitle(property: PropertySeoInput): string {
  const normalized = normalizeTitle(property.title?.trim() || "Propiedad");
  const titleLower = normalized.toLowerCase();

  const segments = [normalized];

  const operation = operationLabel(property.operationType);
  if (operation && !titleLower.includes(operation)) {
    segments.push(`en ${operation}`);
  }

  const locationSuffix = buildLocationSuffix(
    titleLower,
    property.neighborhood,
    property.city,
  );
  if (locationSuffix) segments.push(locationSuffix);

  return segments.join(" ");
}

function formatPropertyPrice(
  price: number,
  currency?: string | null,
): string {
  const symbol = currency === "ARS" ? "AR$" : "US$";
  return `${symbol}${price.toLocaleString("es-AR")}`;
}

function trimAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
}

function joinSentencesWithinLimit(
  sentences: string[],
  maxLength: number,
): string {
  let result = "";
  for (const sentence of sentences) {
    const candidate = result ? `${result} ${sentence}` : sentence;
    if (candidate.length > maxLength) {
      return result || trimAtWordBoundary(candidate, maxLength);
    }
    result = candidate;
  }
  return result;
}

const MENTIONS_ROOMS_PATTERN = /dormitorio|ambiente/i;

/**
 * Composes a property meta description from title, operation, city, subtitle,
 * bedrooms and price, ending with a WhatsApp call to action. Trimmed to at
 * most 155 characters at a sentence/word boundary.
 */
export function buildPropertyDescription(property: PropertySeoInput): string {
  const sentences: string[] = [];

  const titleSentence = buildPropertyTitle(property);
  sentences.push(`${titleSentence}.`);

  const subtitle = property.subtitle?.trim();
  if (subtitle) {
    sentences.push(`${normalizeTitle(subtitle)}.`);
  }

  if (
    typeof property.rooms === "number" &&
    property.rooms > 0 &&
    !MENTIONS_ROOMS_PATTERN.test(property.title ?? "")
  ) {
    const label = property.rooms === 1 ? "dormitorio" : "dormitorios";
    sentences.push(`${property.rooms} ${label}.`);
  }

  if (typeof property.price === "number") {
    sentences.push(`${formatPropertyPrice(property.price, property.currency)}.`);
  }

  sentences.push("Consultá por WhatsApp con DZTS Inmobiliaria.");

  return joinSentencesWithinLimit(sentences, MAX_DESCRIPTION_LENGTH);
}
