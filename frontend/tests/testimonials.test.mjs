import assert from "node:assert/strict";
import test from "node:test";
import {
  deleteTestimonial,
  getPublishedTestimonials,
  setTestimonialStatus,
  submitCustomerTestimonial,
  upsertTestimonial,
} from "../src/features/testimonials/utils/testimonials.ts";

const SAMPLE_BOOKINGS = [
  {
    id: "bk-done",
    bookingCode: "BK-20261110-D004",
    customerName: "Sinta L.",
    customerPhone: "6281234567806",
    carId: "car-brio",
    carName: "Honda Brio",
    startDate: "2026-11-12",
    endDate: "2026-11-14",
    totalDays: 3,
    serviceType: "SELF_DRIVE",
    estimatedPrice: 900_000,
    finalPrice: 900_000,
    status: "COMPLETED",
    internalNote: "",
    createdAt: "2026-11-10",
  },
  {
    id: "bk-pend",
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
    status: "PENDING",
    internalNote: "",
    createdAt: "2026-11-19",
  },
];

test("submitCustomerTestimonial requires COMPLETED booking and prevents duplicate", () => {
  const notCompleted = submitCustomerTestimonial(
    {
      bookingCode: "BK-20261119-A001",
      rating: 5,
      tripLabel: "Wisata",
      quote: "Mantap!",
    },
    SAMPLE_BOOKINGS,
    []
  );
  assert.equal(notCompleted.ok, false);

  const valid = submitCustomerTestimonial(
    {
      bookingCode: "BK-20261110-D004",
      rating: 5,
      tripLabel: "Wisata Keluarga",
      quote: "Mobil sangat bersih dan wangi.",
    },
    SAMPLE_BOOKINGS,
    []
  );
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.item.status, "PENDING");
    assert.equal(valid.item.customerName, "Sinta L.");
    assert.equal(valid.item.carName, "Honda Brio");

    const duplicate = submitCustomerTestimonial(
      {
        bookingCode: "BK-20261110-D004",
        rating: 4,
        tripLabel: "Wisata",
        quote: "Kirim ulang",
      },
      SAMPLE_BOOKINGS,
      valid.testimonials
    );
    assert.equal(duplicate.ok, false);
  }
});

test("moderation status, upsert, delete, and published filtering work cleanly", () => {
  const added = upsertTestimonial([], {
    customerName: "Rama T.",
    carName: "Toyota Innova Reborn",
    tripLabel: "Perjalanan Dinas",
    rating: 5,
    quote: "Sopir ramah dan tepat waktu.",
    status: "PENDING",
  });
  assert.equal(added.length, 1);
  assert.equal(getPublishedTestimonials(added).length, 0);

  const published = setTestimonialStatus(added, added[0].id, "PUBLISHED");
  assert.equal(getPublishedTestimonials(published).length, 1);

  const removed = deleteTestimonial(published, published[0].id);
  assert.equal(removed.length, 0);
});
