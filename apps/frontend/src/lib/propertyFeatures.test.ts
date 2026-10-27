import { describe, it, expect } from "vitest";
import {
  formatRooms,
  getRoomsUnit,
  isPositive,
  MONOAMBIENTE_LABEL,
} from "./propertyFeatures";

describe("isPositive", () => {
  it("is true only for numbers greater than zero", () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(0)).toBe(false);
    expect(isPositive(null)).toBe(false);
    expect(isPositive(undefined)).toBe(false);
  });
});

describe("getRoomsUnit", () => {
  it("handles singular and plural in both styles", () => {
    expect(getRoomsUnit(1, "long")).toBe("dormitorio");
    expect(getRoomsUnit(2, "long")).toBe("dormitorios");
    expect(getRoomsUnit(1, "short")).toBe("dorm.");
    expect(getRoomsUnit(3, "short")).toBe("dorms.");
  });
});

describe("formatRooms", () => {
  it("returns Monoambiente for zero", () => {
    expect(formatRooms(0)).toBe(MONOAMBIENTE_LABEL);
    expect(formatRooms(0, "short")).toBe("Monoambiente");
  });

  it("formats positive counts", () => {
    expect(formatRooms(1)).toBe("1 dormitorio");
    expect(formatRooms(2)).toBe("2 dormitorios");
    expect(formatRooms(1, "short")).toBe("1 dorm.");
    expect(formatRooms(2, "short")).toBe("2 dorms.");
  });
});
