import { describe, expect, it } from "vitest";
import { safeEmbedHtml } from "./embedHtml";

const AFIP_SNIPPET =
  '<a href="http://qr.afip.gob.ar/?qr=BpQ_PtKlcp9gt-m5dp02NQ,," target="_F960AFIPInfo"><img src="http://www.afip.gob.ar/images/f960/DATAWEB.jpg" border="0"></a>';

describe("safeEmbedHtml", () => {
  it("returns the AFIP Data Fiscal snippet unchanged", () => {
    expect(safeEmbedHtml(AFIP_SNIPPET)).toBe(AFIP_SNIPPET);
  });

  it("trims surrounding whitespace", () => {
    expect(safeEmbedHtml(`\n  ${AFIP_SNIPPET}  \n`)).toBe(AFIP_SNIPPET);
  });

  it("returns null for empty, null or undefined", () => {
    expect(safeEmbedHtml("   ")).toBeNull();
    expect(safeEmbedHtml(null)).toBeNull();
    expect(safeEmbedHtml(undefined)).toBeNull();
  });

  it("rejects scripts, iframes, event handlers and javascript: URLs", () => {
    expect(safeEmbedHtml("<script>alert(1)</script>")).toBeNull();
    expect(
      safeEmbedHtml('<iframe src="https://example.com"></iframe>'),
    ).toBeNull();
    expect(safeEmbedHtml('<img src="x" onerror="alert(1)">')).toBeNull();
    expect(safeEmbedHtml('<a href="javascript:alert(1)">x</a>')).toBeNull();
  });

  it("rejects slash-separated handlers, encoded schemes and page-altering tags", () => {
    expect(safeEmbedHtml("<img src=x/onerror=alert(1)>")).toBeNull();
    expect(safeEmbedHtml("<svg/onload=alert(1)>")).toBeNull();
    expect(
      safeEmbedHtml('<a href="&#106;avascript:alert(1)">x</a>'),
    ).toBeNull();
    expect(safeEmbedHtml('<base href="https://evil.example/">')).toBeNull();
    expect(
      safeEmbedHtml(
        '<meta http-equiv="refresh" content="0;url=https://evil.example">',
      ),
    ).toBeNull();
    expect(safeEmbedHtml("<style>body{display:none}</style>")).toBeNull();
    expect(
      safeEmbedHtml('<form action="https://evil.example"></form>'),
    ).toBeNull();
  });
});
