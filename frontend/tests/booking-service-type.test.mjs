import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const modalSource = readFileSync(
  new URL("../src/features/cars/components/BookingModal.tsx", import.meta.url),
  "utf8"
);

const bookingUtilSource = readFileSync(
  new URL("../src/features/cars/utils/booking.ts", import.meta.url),
  "utf8"
);

test("BookingModal provides Lepas Kunci and Dengan Sopir service selector", () => {
  assert.match(modalSource, /role="radiogroup"/);
  assert.match(modalSource, /SERVICE_TYPE_LABELS\.SELF_DRIVE/);
  assert.match(modalSource, /SERVICE_TYPE_LABELS\.WITH_DRIVER/);
});

test("buildBookingMessage includes selected rental service type", () => {
  assert.match(bookingUtilSource, /SELF_DRIVE:\s*"Lepas Kunci"/);
  assert.match(bookingUtilSource, /WITH_DRIVER:\s*"Dengan Sopir"/);
  assert.match(bookingUtilSource, /- Layanan: \$\{SERVICE_TYPE_LABELS\[serviceType\]\}/);
});

