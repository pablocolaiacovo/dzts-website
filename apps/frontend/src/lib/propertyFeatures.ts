export type RoomsLabelStyle = "short" | "long";

export const MONOAMBIENTE_LABEL = "Monoambiente";

export function isPositive(value: number | null | undefined): value is number {
  return typeof value === "number" && value > 0;
}

export function getRoomsUnit(
  count: number,
  style: RoomsLabelStyle = "long",
): string {
  if (style === "short") return count === 1 ? "dorm." : "dorms.";
  return count === 1 ? "dormitorio" : "dormitorios";
}

export function formatRooms(
  count: number,
  style: RoomsLabelStyle = "long",
): string {
  if (count === 0) return MONOAMBIENTE_LABEL;
  return `${count} ${getRoomsUnit(count, style)}`;
}
