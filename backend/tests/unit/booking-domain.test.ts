import { describe, expect, it } from "vitest";
import {
  canTransitionStatus,
  canUseDownPayment,
  computePaymentSummary,
  getAllowedPaymentStatuses,
} from "../../src/modules/bookings/booking.domain.js";
import { calculateInclusiveDays } from "../../src/utils/date.js";

describe("Booking domain rules", () => {
  it("calculates inclusive calendar days", () => {
    expect(calculateInclusiveDays("2026-12-01", "2026-12-01")).toBe(1);
    expect(calculateInclusiveDays("2026-12-01", "2026-12-03")).toBe(3);
  });

  it("allows DP_50 only when totalDays >= 3", () => {
    expect(canUseDownPayment(2)).toBe(false);
    expect(canUseDownPayment(3)).toBe(true);
  });

  it("enforces state machine transitions", () => {
    expect(canTransitionStatus("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransitionStatus("PENDING", "COMPLETED")).toBe(false);
    expect(canTransitionStatus("CONFIRMED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionStatus("IN_PROGRESS", "COMPLETED")).toBe(true);
    expect(canTransitionStatus("COMPLETED", "CANCELLED")).toBe(false);
  });

  it("prevents payment status regression during IN_PROGRESS", () => {
    expect(getAllowedPaymentStatuses("IN_PROGRESS", "DP_50", "DP_PAID")).toEqual([
      "PAID",
    ]);
    expect(getAllowedPaymentStatuses("IN_PROGRESS", "FULL", "PAID")).toEqual([
      "PAID",
    ]);
  });

  it("computes DP_50 and PAID summaries accurately", () => {
    expect(computePaymentSummary(900000, "DP_50", "DP_PAID")).toEqual({
      paymentScheme: "DP_50",
      paymentStatus: "DP_PAID",
      dpAmount: 450000,
      paidAmount: 450000,
      remainingAmount: 450000,
    });
    expect(computePaymentSummary(900000, "FULL", "PAID")).toEqual({
      paymentScheme: "FULL",
      paymentStatus: "PAID",
      dpAmount: 900000,
      paidAmount: 900000,
      remainingAmount: 0,
    });
  });
});

