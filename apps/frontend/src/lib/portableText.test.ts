import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PortableText } from "@portabletext/react";
import { describe, expect, it } from "vitest";
import { portableTextHeadingsAs, withoutEmptyBlocks } from "./portableText";

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

describe("withoutEmptyBlocks", () => {
  it("drops blocks whose text is empty or whitespace", () => {
    const value = [
      block("normal", ""),
      block("h5", "Tasaciones"),
      block("normal", "  \n "),
      { ...block("normal", "x"), children: [] },
      block("normal", "Texto"),
    ];
    expect(withoutEmptyBlocks(value).map((b) => b.children[0]?.text)).toEqual([
      "Tasaciones",
      "Texto",
    ]);
  });

  it("keeps a block when any span has text", () => {
    const mixed = {
      ...block("normal", ""),
      children: [
        { _type: "span", _key: "a", text: "", marks: ["strong"] },
        { _type: "span", _key: "b", text: "Hola", marks: [] },
      ],
    };
    expect(withoutEmptyBlocks([mixed])).toEqual([mixed]);
  });

  it("leaves non-block items untouched", () => {
    const image = { _type: "image", _key: "img" };
    expect(withoutEmptyBlocks([image, block("normal", "")])).toEqual([image]);
  });
});
