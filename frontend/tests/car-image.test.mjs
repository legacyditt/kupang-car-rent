import assert from "node:assert/strict";
import test from "node:test";
import {
  computeNormalizedPlacement,
  MAX_IMAGE_FILE_BYTES,
  TARGET_CANVAS_HEIGHT,
  TARGET_CANVAS_WIDTH,
  validateCarImageDimensions,
  validateCarImageFile,
} from "../src/features/cars/utils/car-image.ts";

test("validateCarImageFile accepts JPG/PNG/WEBP within 5MB and rejects others", () => {
  assert.deepEqual(
    validateCarImageFile({ type: "image/jpeg", size: 1_000_000 }),
    { ok: true }
  );
  assert.deepEqual(
    validateCarImageFile({ type: "image/png", size: 2_000_000 }),
    { ok: true }
  );
  assert.deepEqual(
    validateCarImageFile({ type: "image/webp", size: 500_000 }),
    { ok: true }
  );

  const badType = validateCarImageFile({ type: "image/gif", size: 500_000 });
  assert.equal(badType.ok, false);

  const tooBig = validateCarImageFile({
    type: "image/jpeg",
    size: MAX_IMAGE_FILE_BYTES + 1,
  });
  assert.equal(tooBig.ok, false);
});

test("validateCarImageDimensions enforces minimum 640x400 resolution", () => {
  assert.deepEqual(validateCarImageDimensions(640, 400), { ok: true });
  assert.deepEqual(validateCarImageDimensions(1920, 1080), { ok: true });

  const tooSmall = validateCarImageDimensions(500, 400);
  assert.equal(tooSmall.ok, false);
});

test("computeNormalizedPlacement fits within 88%x78% and centers on 1600x1000 canvas", () => {
  const wide = computeNormalizedPlacement(1920, 1080);
  assert.ok(wide.width <= TARGET_CANVAS_WIDTH * 0.88);
  assert.ok(wide.height <= TARGET_CANVAS_HEIGHT * 0.78);
  assert.ok(Math.abs(wide.x * 2 + wide.width - TARGET_CANVAS_WIDTH) <= 1);
  assert.ok(Math.abs(wide.y * 2 + wide.height - TARGET_CANVAS_HEIGHT) <= 1);

  const square = computeNormalizedPlacement(1000, 1000);
  assert.equal(square.width, 780);
  assert.equal(square.height, 780);
  assert.equal(square.x, 410);
  assert.equal(square.y, 110);
});
