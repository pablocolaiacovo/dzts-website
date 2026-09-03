import { describe, it, expect } from "vitest";
import { SITE_NAME, withSiteName } from "./seo";

describe("withSiteName", () => {
  it("appends the site name when the title doesn't already contain it", () => {
    expect(withSiteName("Inicio")).toBe(`Inicio | ${SITE_NAME}`);
  });

  it("leaves the title as-is when it already contains the site name", () => {
    expect(withSiteName(`Inicio | ${SITE_NAME}`)).toBe(`Inicio | ${SITE_NAME}`);
  });

  it("matches the site name case-insensitively", () => {
    expect(withSiteName("Inicio | dzts inmobiliaria")).toBe(
      "Inicio | dzts inmobiliaria",
    );
  });
});
