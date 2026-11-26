import type {
  Testimonial,
  TestimonialStatus,
} from "../../generated/prisma/client.js";
import { AppError } from "../../utils/AppError.js";
import { formatUtcDateYyyyMmDd } from "../../utils/date.js";
import { TestimonialRepository } from "./testimonial.repository.js";
import type {
  AdminUpsertTestimonialInput,
  SubmitPublicTestimonialInput,
} from "./testimonial.schema.js";

const SERVICE_TYPE_LABELS = {
  SELF_DRIVE: "Lepas Kunci",
  WITH_DRIVER: "Dengan Sopir",
} as const;

export interface TestimonialDto {
  id: string;
  bookingCode?: string;
  customerName: string;
  carName: string;
  tripLabel: string;
  rating: number;
  quote: string;
  status: TestimonialStatus;
  createdAt: string;
}

export type PublicTestimonialDto = Omit<TestimonialDto, "bookingCode">;

function toDto(t: Testimonial): TestimonialDto {
  return {
    id: t.id,
    ...(t.bookingCode ? { bookingCode: t.bookingCode } : {}),
    customerName: t.customerName,
    carName: t.carName,
    tripLabel: t.tripLabel,
    rating: t.rating,
    quote: t.quote,
    status: t.status,
    createdAt: formatUtcDateYyyyMmDd(t.createdAt),
  };
}

function toPublicDto(t: Testimonial): PublicTestimonialDto {
  const { bookingCode: _code, ...pub } = toDto(t);
  return pub;
}

export class TestimonialService {
  constructor(private readonly repo: TestimonialRepository) {}

  async listPublished(): Promise<PublicTestimonialDto[]> {
    const rows = await this.repo.findPublished();
    return rows.map(toPublicDto);
  }

  async listAllAdmin(): Promise<TestimonialDto[]> {
    const rows = await this.repo.findAll();
    return rows.map(toDto);
  }

  async checkEligibility(rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { eligible: false, reason: "Kode booking wajib diisi." };
    }

    const booking = await this.repo.findBookingByCode(code);
    if (!booking || booking.status !== "COMPLETED") {
      return {
        eligible: false,
        reason:
          "Kode booking tidak ditemukan atau penyewaan belum berstatus Selesai.",
      };
    }

    const existing = await this.repo.findByBookingCode(code);
    if (existing) {
      return {
        eligible: false,
        reason: "Ulasan untuk penyewaan ini sudah pernah dikirim.",
      };
    }

    return {
      eligible: true,
      booking: {
        bookingCode: booking.bookingCode,
        customerName: booking.customerName,
        carName: booking.carNameSnapshot,
        tripLabel: SERVICE_TYPE_LABELS[booking.serviceType],
      },
    };
  }

  async submitPublic(
    input: SubmitPublicTestimonialInput
  ): Promise<PublicTestimonialDto> {
    const booking = await this.repo.findBookingByCode(input.bookingCode);
    if (!booking) {
      throw new AppError(404, "BOOKING_NOT_FOUND", "Kode booking tidak ditemukan.");
    }
    if (booking.status !== "COMPLETED") {
      throw new AppError(
        400,
        "BOOKING_NOT_COMPLETED",
        "Testimoni hanya dapat diisi setelah penyewaan berstatus Selesai."
      );
    }

    const existing = await this.repo.findByBookingCode(booking.bookingCode);
    if (existing) {
      throw new AppError(
        409,
        "TESTIMONIAL_ALREADY_SUBMITTED",
        "Testimoni untuk kode booking ini sudah pernah dikirim."
      );
    }

    const created = await this.repo.create({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      customerName: input.customerName ?? booking.customerName,
      carName: booking.carNameSnapshot,
      tripLabel: SERVICE_TYPE_LABELS[booking.serviceType],
      rating: input.rating,
      quote: input.quote,
      status: "PENDING",
    });

    return toPublicDto(created);
  }

  async createAdmin(input: AdminUpsertTestimonialInput): Promise<TestimonialDto> {
    const created = await this.repo.create({
      customerName: input.customerName,
      carName: input.carName,
      tripLabel: input.tripLabel,
      rating: input.rating,
      quote: input.quote,
      status: input.status,
    });
    return toDto(created);
  }

  async updateAdmin(
    id: string,
    input: Partial<AdminUpsertTestimonialInput>
  ): Promise<TestimonialDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(404, "TESTIMONIAL_NOT_FOUND", "Testimoni tidak ditemukan.");
    }

    const updated = await this.repo.update(id, {
      ...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
      ...(input.carName !== undefined ? { carName: input.carName } : {}),
      ...(input.tripLabel !== undefined ? { tripLabel: input.tripLabel } : {}),
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
      ...(input.quote !== undefined ? { quote: input.quote } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });
    return toDto(updated);
  }

  async setStatus(
    id: string,
    status: TestimonialStatus
  ): Promise<TestimonialDto> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(404, "TESTIMONIAL_NOT_FOUND", "Testimoni tidak ditemukan.");
    }

    const updated = await this.repo.update(id, { status });
    return toDto(updated);
  }

  async deleteAdmin(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(404, "TESTIMONIAL_NOT_FOUND", "Testimoni tidak ditemukan.");
    }
    await this.repo.delete(id);
  }
}

