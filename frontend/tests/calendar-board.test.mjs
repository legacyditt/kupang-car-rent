import assert from "node:assert/strict";
import test from "node:test";
import { buildCalendarBoardCells } from "../src/features/bookings/utils/calendar-board.ts";

const SAMPLE_BOOKINGS = [
  {
    id: "bk-1",
    bookingCode: "BK-20261119-A001",
    customerName: "Delano K.",
    customerPhone: "6281234567801",
    carId: "car-avanza",
    carName: "Toyota Avanza",
    startDate: "2026-11-26",
    endDate: "2026-11-28",
    totalDays: 3,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 900_000,
    finalPrice: 900_000,
    status: "PENDING",
    internalNote: "",
    createdAt: "2026-11-19",
  },
  {
    id: "bk-2",
    bookingCode: "BK-20261117-C008",
    customerName: "Hendra P.",
    customerPhone: "6281234567805",
    carId: "car-brio",
    carName: "Honda Brio",
    startDate: "2026-11-22",
    endDate: "2026-11-23",
    totalDays: 2,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 600_000,
    finalPrice: 600_000,
    status: "CONFIRMED",
    internalNote: "",
    createdAt: "2026-11-17",
  },
  {
    id: "bk-3",
    bookingCode: "BK-20261118-X001",
    customerName: "Batal Y.",
    customerPhone: "6281234567809",
    carId: "car-avanza",
    carName: "Toyota Avanza",
    startDate: "2026-11-20",
    endDate: "2026-11-21",
    totalDays: 2,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 600_000,
    finalPrice: 600_000,
    status: "CANCELLED",
    internalNote: "",
    createdAt: "2026-11-18",
  },
  {
    id: "bk-4",
    bookingCode: "BK-20261118-X002",
    customerName: "Tolak Z.",
    customerPhone: "6281234567810",
    carId: "car-avanza",
    carName: "Toyota Avanza",
    startDate: "2026-11-19",
    endDate: "2026-11-19",
    totalDays: 1,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 300_000,
    finalPrice: 300_000,
    status: "REJECTED",
    internalNote: "",
    createdAt: "2026-11-18",
  },
];

test("buildCalendarBoardCells builds full week-aligned grid and maps multi-day bookings", () => {
  // November 2026: Nov 1 is Sunday (0), 30 days -> 35 cells (5 rows)
  const cells = buildCalendarBoardCells(2026, 10, SAMPLE_BOOKINGS, "ALL");
  assert.equal(cells.length % 7, 0);

  const nov26 = cells.find((c) => c.dateStr === "2026-11-26");
  const nov27 = cells.find((c) => c.dateStr === "2026-11-27");
  const nov28 = cells.find((c) => c.dateStr === "2026-11-28");
  assert.equal(nov26?.bookings.length, 1);
  assert.equal(nov27?.bookings[0].id, "bk-1");
  assert.equal(nov28?.bookings[0].id, "bk-1");

  // CANCELLED and REJECTED are excluded
  const nov19 = cells.find((c) => c.dateStr === "2026-11-19");
  const nov20 = cells.find((c) => c.dateStr === "2026-11-20");
  assert.equal(nov19?.bookings.length, 0);
  assert.equal(nov20?.bookings.length, 0);
});

test("buildCalendarBoardCells filters bookings by carId", () => {
  const brioOnly = buildCalendarBoardCells(
    2026,
    10,
    SAMPLE_BOOKINGS,
    "car-brio"
  );
  const nov26 = brioOnly.find((c) => c.dateStr === "2026-11-26");
  const nov22 = brioOnly.find((c) => c.dateStr === "2026-11-22");
  assert.equal(nov26?.bookings.length, 0);
  assert.equal(nov22?.bookings.length, 1);
  assert.equal(nov22?.bookings[0].id, "bk-2");
});

