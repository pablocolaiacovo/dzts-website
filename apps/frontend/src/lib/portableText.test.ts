import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PortableText } from "@portabletext/react";
import { describe, expect, it } from "vitest";
import { portableTextHeadingsAs } from "./portableText";

const block = (style: string, text: string) => ({
  _type: "block",
  _key: `${style}-${text}`,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: "s", text, marks: [] }],
});

function render(tag: "h2" | "h3", value: ReturnType<typeof block>[]) {
  return renderToStaticMarkup(
    createElement(PortableText, {
      value,
      components: portableTextHeadingsAs(tag),
    }),
  );
}

describe("portableTextHeadingsAs", () => {
  it("renders every heading style at the requested level, keeping its style as a class", () => {
    expect(render("h3", [block("h6", "Superficie")])).toBe(
      '<h3 class="h6">Superficie</h3>',
    );
    expect(render("h2", [block("h5", "Tasaciones")])).toBe(
      '<h2 class="h5">Tasaciones</h2>',
    );
    expect(render("h3", [block("h1", "Grande")])).toBe(
      '<h3 class="h1">Grande</h3>',
    );
  });

  it("leaves normal paragraphs untouched", () => {
    expect(render("h3", [block("normal", "Texto")])).toBe("<p>Texto</p>");
  });
});
