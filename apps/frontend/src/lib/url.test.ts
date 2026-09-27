import { describe, expect, it } from "vitest";
import { extractUrl } from "./url";

describe("extractUrl", () => {
  it("extracts the QR link from the footerLinks AFIP snippet (leading quote, no href attr)", () => {
    const raw =
      '"http://qr.afip.gob.ar/?qr=BpQ_PtKlcp9gt-m5dp02NQ,," target="_F960AFIPInfo"><img src="http://www.afip.gob.ar/images/f960/DATAWEB.jpg" border="0"></a>';
    expect(extractUrl(raw)).toBe("http://qr.afip.gob.ar/?qr=BpQ_PtKlcp9gt-m5dp02NQ,,");
  });

  it("extracts the QR link from the certificationLogos AFIP snippet (no href attr)", () => {
    const raw =
      'http://qr.afip.gob.ar/?qr=OahiXZeOt0L6tWdbB6VybQ,, target="_F960AFIPInfo"><img src=';
    expect(extractUrl(raw)).toBe("http://qr.afip.gob.ar/?qr=OahiXZeOt0L6tWdbB6VybQ,,");
  });

  it("extracts the href value from a full AFIP anchor snippet, not the img src", () => {
    const raw =
      '<a href="http://qr.afip.gob.ar/?qr=BpQ_PtKlcp9gt-m5dp02NQ,," target="_F960AFIPInfo"><img src="http://www.afip.gob.ar/images/f960/DATAWEB.jpg" border="0"></a>';
    expect(extractUrl(raw)).toBe("http://qr.afip.gob.ar/?qr=BpQ_PtKlcp9gt-m5dp02NQ,,");
  });

  it("returns a clean https URL unchanged", () => {
    expect(extractUrl("https://example.com/page")).toBe("https://example.com/page");
  });

  it("returns an internal path starting with / as-is", () => {
    expect(extractUrl("/propiedades/?operacion=venta")).toBe("/propiedades/?operacion=venta");
  });

  it("returns an internal anchor starting with # as-is", () => {
    expect(extractUrl("/#servicios")).toBe("/#servicios");
  });

  it("returns null for an empty string", () => {
    expect(extractUrl("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(extractUrl(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(extractUrl(undefined)).toBeNull();
  });

  it("returns null for garbage text without a URL", () => {
    expect(extractUrl("not a url at all")).toBeNull();
  });
});
