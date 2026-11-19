import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/features/cars/components/CarCard.tsx", import.meta.url),
  "utf8"
);

test("CarCard clamps title and pins CTA to bottom", () => {
  assert.match(source, /line-clamp-2/);
  assert.match(source, /mt-auto pt-5/);
  assert.doesNotMatch(source, /className="mt-4 w-full"/);
});
