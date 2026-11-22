import { useEffect, useMemo, useState } from "react";
import { readStoredBookings } from "@/features/bookings/utils/bookings-storage";
import type {
  TestimonialItem,
  TestimonialStatus,
  UpsertTestimonialInput,
} from "../types/testimonial.types";
import {
  deleteTestimonial,
  getPublishedTestimonials,
  setTestimonialStatus,
  submitCustomerTestimonial,
  upsertTestimonial,
} from "../utils/testimonials";
import {
  readStoredTestimonials,
  subscribeStoredTestimonials,
  writeStoredTestimonials,
} from "../utils/testimonials-storage";

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    readStoredTestimonials
  );

  useEffect(() => {
    return subscribeStoredTestimonials(() => {
      setTestimonials(readStoredTestimonials());
    });
  }, []);

  const publishedTestimonials = useMemo(
    () => getPublishedTestimonials(testimonials),
    [testimonials]
  );

  const persist = (next: TestimonialItem[]) => {
    setTestimonials(next);
    writeStoredTestimonials(next);
  };

  const submitPublic = (input: {
    bookingCode: string;
    rating: number;
    tripLabel: string;
    quote: string;
  }) => {
    const res = submitCustomerTestimonial(
      input,
      readStoredBookings(),
      readStoredTestimonials()
    );
    if (!res.ok) return res;
    persist(res.testimonials);
    return { ok: true as const, item: res.item };
  };

  const changeStatus = (id: string, status: TestimonialStatus) => {
    persist(setTestimonialStatus(testimonials, id, status));
  };

  const saveTestimonial = (input: UpsertTestimonialInput) => {
    persist(upsertTestimonial(testimonials, input));
  };

  const removeTestimonial = (id: string) => {
    persist(deleteTestimonial(testimonials, id));
  };

  return {
    testimonials,
    publishedTestimonials,
    submitPublic,
    changeStatus,
    saveTestimonial,
    removeTestimonial,
  };
}
