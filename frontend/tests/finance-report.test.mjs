import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFinanceReport,
  getAvailableReportMonths,
} from "../src/features/finance/utils/finance-report.ts";

const SAMPLE_BOOKINGS = [
  {
    id: "bk-1",
    bookingCode: "BK-20261119-A001",
    customerName: "Delano K.",
    customerPhone: "6281234567801",
    carId: "car-avanza",
    carName: "Toyota Avanza",
    startDate: "2026-11-26",
    endDate: "2026-11-30",
    totalDays: 5,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 1_500_000,
    finalPrice: 1_500_000,
    paymentScheme: "DP_50",
    paymentStatus: "DP_PAID",
    paidAmount: 750_000,
    status: "CONFIRMED",
    internalNote: "",
    createdAt: "2026-11-19",
  },
  {
    id: "bk-2",
    bookingCode: "BK-20261118-B014",
    customerName: "Maria N.",
    customerPhone: "6281234567804",
    carId: "car-innova-reborn",
    carName: "Toyota Innova Reborn",
    startDate: "2026-12-01",
    endDate: "2026-12-03",
    totalDays: 3,
    serviceType: "WITH_DRIVER",
    estimatedPrice: 900_000,
    finalPrice: 900_000,
    paymentScheme: "FULL",
    paymentStatus: "PAID",
    paidAmount: 900_000,
    status: "COMPLETED",
    internalNote: "",
    createdAt: "2026-11-18",
  },
  {
    id: "bk-3",
    bookingCode: "BK-20261119-A003",
    customerName: "Bima S.",
    customerPhone: "6281234567803",
    carId: "car-avanza",
    carName: "Toyota Avanza",
    startDate: "2026-11-21",
    endDate: "2026-11-23",
    totalDays: 3,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 900_000,
    finalPrice: 900_000,
    paymentScheme: "FULL",
    paymentStatus: "UNPAID",
    paidAmount: 0,
    status: "PENDING",
    internalNote: "",
    createdAt: "2026-11-19",
  },
];

test("buildFinanceReport includes only DP_PAID and PAID bookings and computes totals", () => {
  const all = buildFinanceReport(SAMPLE_BOOKINGS, "ALL");
  assert.equal(all.rows.length, 2);
  assert.equal(all.totalPaid, 1_650_000);
  assert.equal(all.totalRemaining, 750_000);
  assert.equal(all.dpCount, 1);
  assert.equal(all.paidCount, 1);

  const novOnly = buildFinanceReport(SAMPLE_BOOKINGS, "2026-11");
  assert.equal(novOnly.rows.length, 1);
  assert.equal(novOnly.totalPaid, 750_000);
  assert.equal(novOnly.totalRemaining, 750_000);
});

test("getAvailableReportMonths extracts sorted unique YYYY-MM months", () => {
  assert.deepEqual(getAvailableReportMonths(SAMPLE_BOOKINGS), [
    "2026-12",
    "2026-11",
  ]);
});
