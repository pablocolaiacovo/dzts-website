import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl } from "./whatsapp";

describe("buildWhatsAppUrl", () => {
  it("builds a plain link without a message", () => {
    expect(buildWhatsAppUrl("5491112345678")).toBe("https://wa.me/5491112345678");
    expect(buildWhatsAppUrl("5491112345678", null)).toBe("https://wa.me/5491112345678");
    expect(buildWhatsAppUrl("5491112345678", "")).toBe("https://wa.me/5491112345678");
  });

  it("encodes the prefilled message", () => {
    expect(buildWhatsAppUrl("5491112345678", "Hola, ¿cómo están?")).toBe(
      "https://wa.me/5491112345678?text=Hola%2C%20%C2%BFc%C3%B3mo%20est%C3%A1n%3F",
    );
  });
});
