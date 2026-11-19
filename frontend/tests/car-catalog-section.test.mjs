import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL(
    "../src/features/cars/components/CarCatalogSection.tsx",
    import.meta.url
  ),
  "utf8"
);

test("catalog uses desktop 2-4 col grid and mobile depth-focus carousel", () => {
  assert.match(source, /mt-10 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4/);
  assert.match(source, /aria-roledescription="carousel"/);
});
