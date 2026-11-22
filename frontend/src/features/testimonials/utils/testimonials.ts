import type { BookingItem } from "../../bookings/types/booking.types";
import type {
  TestimonialItem,
  TestimonialStatus,
  UpsertTestimonialInput,
} from "../types/testimonial.types";

export const TESTIMONIAL_STATUS_LABELS: Record<TestimonialStatus, string> = {
  PENDING: "Menunggu",
  PUBLISHED: "Ditampilkan",
  HIDDEN: "Disembunyikan",
};

function todayYyyymmdd(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getPublishedTestimonials(
  items: TestimonialItem[]
): TestimonialItem[] {
  return items.filter((item) => item.status === "PUBLISHED");
}

/**
 * Validasi pengiriman testimoni publik berdasarkan kode booking berstatus COMPLETED.
 * Mencegah spam dari non-penyewa atau pengiriman ganda untuk kode booking yang sama.
 */
export function submitCustomerTestimonial(
  input: {
    bookingCode: string;
    customerName?: string;
    rating: number;
    tripLabel: string;
    quote: string;
  },
  bookings: BookingItem[],
  existingTestimonials: TestimonialItem[]
):
  | { ok: true; item: TestimonialItem; testimonials: TestimonialItem[] }
  | { ok: false; error: string } {
  const normalizedCode = input.bookingCode.trim().toUpperCase();
  if (!normalizedCode) {
    return { ok: false, error: "Kode booking wajib diisi." };
  }

  const booking = bookings.find(
    (b) => b.bookingCode.toUpperCase() === normalizedCode
  );
  if (!booking) {
    return { ok: false, error: "Kode booking tidak ditemukan." };
  }
  if (booking.status !== "COMPLETED") {
    return {
      ok: false,
      error: "Testimoni hanya dapat diisi setelah penyewaan berstatus Selesai.",
    };
  }

  const alreadySubmitted = existingTestimonials.some(
    (t) => t.bookingCode?.toUpperCase() === normalizedCode
  );
  if (alreadySubmitted) {
    return {
      ok: false,
      error: "Testimoni untuk kode booking ini sudah pernah dikirim.",
    };
  }

  const quote = input.quote.trim();
  if (quote.length < 10) {
    return { ok: false, error: "Ulasan minimal 10 karakter." };
  }

  const customerName =
    input.customerName !== undefined
      ? input.customerName.trim()
      : booking.customerName;
  if (!customerName) {
    return { ok: false, error: "Nama wajib diisi." };
  }

  const rating = Math.max(1, Math.min(5, Math.round(input.rating || 5)));
  const item: TestimonialItem = {
    id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingCode: booking.bookingCode,
    customerName,
    carName: booking.carName,
    tripLabel: input.tripLabel.trim() || "Pelanggan Aventra",
    rating,
    quote,
    status: "PENDING",
    createdAt: todayYyyymmdd(),
  };

  return {
    ok: true,
    item,
    testimonials: [item, ...existingTestimonials],
  };
}

export function setTestimonialStatus(
  items: TestimonialItem[],
  id: string,
  status: TestimonialStatus
): TestimonialItem[] {
  return items.map((item) => (item.id === id ? { ...item, status } : item));
}

export function upsertTestimonial(
  items: TestimonialItem[],
  input: UpsertTestimonialInput
): TestimonialItem[] {
  const normalized: TestimonialItem = {
    id: input.id ?? `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customerName: input.customerName.trim(),
    carName: input.carName.trim() || "Unit Aventra",
    tripLabel: input.tripLabel.trim() || "Pelanggan Aventra",
    rating: Math.max(1, Math.min(5, Math.round(input.rating || 5))),
    quote: input.quote.trim(),
    status: input.status,
    createdAt: todayYyyymmdd(),
  };

  if (input.id && items.some((t) => t.id === input.id)) {
    return items.map((t) =>
      t.id === input.id
        ? { ...t, ...normalized, bookingCode: t.bookingCode, createdAt: t.createdAt }
        : t
    );
  }
  return [normalized, ...items];
}

export function deleteTestimonial(
  items: TestimonialItem[],
  id: string
): TestimonialItem[] {
  return items.filter((item) => item.id !== id);
}

