import assert from "node:assert/strict";
import test from "node:test";
import {
  canTransitionStatus,
  countBookingsByStatus,
  filterBookings,
  hasScheduleConflict,
  transitionBookingStatus,
} from "../src/features/bookings/utils/booking-admin.ts";

const SAMPLE_BOOKINGS = [
  {
    id: "bk-1",
    bookingCode: "BK-20261119-A001",
    customerName: "Delano K.",
    customerPhone: "628123",
    carId: "car-avanza",
    carName: "Toyota Avanza",
    startDate: "2026-11-26",
    endDate: "2026-11-30",
    totalDays: 5,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 1_500_000,
    finalPrice: 1_500_000,
    status: "PENDING",
    internalNote: "",
    createdAt: "2026-11-19",
  },
  {
    id: "bk-2",
    bookingCode: "BK-20261119-A003",
    customerName: "Bima S.",
    customerPhone: "628124",
    carId: "car-avanza",
    carName: "Toyota Avanza",
    startDate: "2026-11-21",
    endDate: "2026-11-23",
    totalDays: 3,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 900_000,
    finalPrice: 900_000,
    status: "PENDING",
    internalNote: "",
    createdAt: "2026-11-19",
  },
  {
    id: "bk-3",
    bookingCode: "BK-20261117-C008",
    customerName: "Hendra P.",
    customerPhone: "628125",
    carId: "car-avanza",
    carName: "Toyota Avanza",
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    totalDays: 3,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 900_000,
    finalPrice: 900_000,
    status: "CONFIRMED",
    internalNote: "",
    createdAt: "2026-11-17",
  },
];

test("canTransitionStatus enforces PRD state machine", () => {
  assert.equal(canTransitionStatus("PENDING", "CONFIRMED"), true);
  assert.equal(canTransitionStatus("PENDING", "COMPLETED"), false);
  assert.equal(canTransitionStatus("CONFIRMED", "IN_PROGRESS"), true);
  assert.equal(canTransitionStatus("IN_PROGRESS", "COMPLETED"), true);
  assert.equal(canTransitionStatus("COMPLETED", "CANCELLED"), false);
});

test("hasScheduleConflict detects overlapping confirmed booking on same car (BR-09)", () => {
  assert.equal(hasScheduleConflict(SAMPLE_BOOKINGS[0], SAMPLE_BOOKINGS), null);
  const conflict = hasScheduleConflict(SAMPLE_BOOKINGS[1], SAMPLE_BOOKINGS);
  assert.equal(conflict?.bookingCode, "BK-20261117-C008");
});

test("transitionBookingStatus blocks double booking and saves final price on valid confirm", () => {
  const blocked = transitionBookingStatus(SAMPLE_BOOKINGS, "bk-2", "CONFIRMED");
  assert.equal(blocked.ok, false);

  const confirmed = transitionBookingStatus(SAMPLE_BOOKINGS, "bk-1", "CONFIRMED", {
    finalPrice: 1_650_000,
    internalNote: "Antar bandara",
  });
  assert.equal(confirmed.ok, true);
  if (confirmed.ok) {
    assert.equal(confirmed.bookings[0].status, "CONFIRMED");
    assert.equal(confirmed.bookings[0].finalPrice, 1_650_000);
    assert.equal(confirmed.bookings[0].internalNote, "Antar bandara");
  }
});

test("filterBookings and countBookingsByStatus work with search query and status", () => {
  const counts = countBookingsByStatus(SAMPLE_BOOKINGS);
  assert.equal(counts.ALL, 3);
  assert.equal(counts.PENDING, 2);
  assert.equal(counts.CONFIRMED, 1);

  assert.equal(filterBookings(SAMPLE_BOOKINGS, "PENDING", "delano").length, 1);
  assert.equal(filterBookings(SAMPLE_BOOKINGS, "ALL", "C008").length, 1);
});
