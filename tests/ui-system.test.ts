import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";

it.each([
  [
    "regular",
    "a9cb1cd82332b23a47e3a1239d25d13c86d16c4220695e34b243effa999f45f2",
  ],
  [
    "medium",
    "086c48dfbea9ddaff1320f7e09399b8e2924e88ce67453721255db3bdbb5a353",
  ],
  ["bold", "c503cc5ec5f8b2c7666b7ecda1adf44bd45f2e6579b2eba0fc292150416588a2"],
])(
  "ships the official v2.304 %s font, not a silent replacement",
  async (weight, digest) => {
    const font = await readFile(
      `public/fonts/jetbrains-mono-v2.304-${weight}.woff2`
    );
    expect(font.subarray(0, 4).toString()).toBe("wOF2");
    expect(createHash("sha256").update(font).digest("hex")).toBe(digest);
  }
);
