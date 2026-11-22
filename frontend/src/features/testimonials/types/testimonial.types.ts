export type TestimonialStatus = "PENDING" | "PUBLISHED" | "HIDDEN";

export interface TestimonialItem {
  id: string;
  bookingCode?: string;
  customerName: string;
  carName: string;
  tripLabel: string;
  rating: number;
  quote: string;
  status: TestimonialStatus;
  createdAt: string; // YYYY-MM-DD
}

export interface UpsertTestimonialInput {
  id?: string;
  customerName: string;
  carName: string;
  tripLabel: string;
  rating: number;
  quote: string;
  status: TestimonialStatus;
}

