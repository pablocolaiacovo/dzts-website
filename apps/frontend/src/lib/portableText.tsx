import type {
  PortableTextBlockComponent,
  PortableTextComponents,
} from "@portabletext/react";

type HeadingTag = "h2" | "h3";

const HEADING_STYLES = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

// Editors pick heading styles for their look, not for document structure, so
// every heading in a Portable Text field renders at the level the page needs,
// with the editor's style kept as a class (`.h1`–`.h6` match the tag sizes).
export function portableTextHeadingsAs(
  Tag: HeadingTag,
): PortableTextComponents {
  const block: Record<string, PortableTextBlockComponent> = {};
  for (const style of HEADING_STYLES) {
    block[style] = ({ children }) => <Tag className={style}>{children}</Tag>;
  }
  return { block };
}

type PortableTextItem = {
  _type: string;
  children?: Array<{ text?: string }>;
};

// Editors leave empty paragraphs as spacers; they render as blank <p> tags.
export function withoutEmptyBlocks<T extends PortableTextItem>(
  value: T[],
): T[] {
  return value.filter(
    (item) =>
      item._type !== "block" ||
      (item.children ?? []).some((child) => child.text?.trim()),
  );
}
