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

test("catalog grid stacks on mobile and uses sm/lg breakpoints", () => {
  assert.match(
    source,
    /mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4/
  );
  assert.doesNotMatch(source, /hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4/);
});
