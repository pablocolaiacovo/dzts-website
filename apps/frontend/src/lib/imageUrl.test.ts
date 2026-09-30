import { createImageUrlBuilder } from "@sanity/image-url";
import { describe, expect, it } from "vitest";

const builder = createImageUrlBuilder({ projectId: "p", dataset: "d" });

describe("image url builder", () => {
  it("applies the crop as a rect param for a dereferenced asset", () => {
    const url = builder
      .image({
        asset: {
          _id: "image-abc123def456-1600x900-png",
          url: "https://cdn.sanity.io/images/p/d/abc123def456-1600x900.png",
        },
        crop: { top: 0.1, bottom: 0.1, left: 0.25, right: 0.25 },
      } as never)
      .width(400)
      .url();
    expect(url).toContain("rect=400,90,800,720");
  });
});
