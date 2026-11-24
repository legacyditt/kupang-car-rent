import {
  Prisma,
  type Booking,
  type BookingStatus,
  type PaymentScheme,
  type PaymentStatus,
} from "../../generated/prisma/client.js";
import { AppError } from "../../utils/AppError.js";
import {
  calculateInclusiveDays,
  formatUtcDateYyyyMmDd,
  parseYyyyMmDdToUtc,
} from "../../utils/date.js";
import {
  BOOKING_STATUS_LABELS,
  canTransitionStatus,
  canUseDownPayment,
  computePaymentSummary,
  getAllowedPaymentStatuses,
} from "./booking.domain.js";
import { BookingRepository } from "./booking.repository.js";
import type {
  AdminCreateBookingInput,
  CreatePublicBookingInput,
  ExtendBookingInput,
  ListBookingsQuery,
  UpdateBookingDetailsInput,
  UpdateBookingPaymentInput,
  UpdateBookingStatusInput,
} from "./booking.schema.js";

export interface BookingDto {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  carId: string;
  carName: string;
  carUnitId: string | null;
  carUnitLabel: string | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  serviceType: Booking["serviceType"];
  transmissionPreference: Booking["transmissionPreference"];
  pickupLocation: string | null;
  customerNotes: string | null;
  pricePerDaySnapshot: number;
  estimatedPrice: number;
  additionalFee: number;
  finalPrice: number;
  paymentScheme: PaymentScheme;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  status: BookingStatus;
  internalNote: string;
  createdAt: string;
}

export type PublicBookingDto = Omit<
  BookingDto,
  "internalNote" | "carUnitId" | "carUnitLabel"
>;

function toBookingDto(b: Booking): BookingDto {
  return {
    id: b.id,
    bookingCode: b.bookingCode,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    carId: b.carId,
    carName: b.carNameSnapshot,
    carUnitId: b.carUnitId,
    carUnitLabel: b.carUnitLabelSnapshot,
    startDate: formatUtcDateYyyyMmDd(b.startDate),
    endDate: formatUtcDateYyyyMmDd(b.endDate),
    totalDays: b.totalDays,
    serviceType: b.serviceType,
    transmissionPreference: b.transmissionPreference,
    pickupLocation: b.pickupLocation,
    customerNotes: b.customerNotes,
    pricePerDaySnapshot: b.pricePerDaySnapshot,
    estimatedPrice: b.estimatedPrice,
    additionalFee: b.additionalFee,
    finalPrice: b.finalPrice,
    paymentScheme: b.paymentScheme,
    paymentStatus: b.paymentStatus,
    paidAmount: b.paidAmount,
    status: b.status,
    internalNote: b.internalNote,
    createdAt: formatUtcDateYyyyMmDd(b.createdAt),
  };
}

function toPublicBookingDto(b: Booking): PublicBookingDto {
  const {
    internalNote: _n,
    carUnitId: _uid,
    carUnitLabel: _ulbl,
    ...pub
  } = toBookingDto(b);
  return pub;
}

export class BookingService {
  constructor(private readonly repo: BookingRepository) {}

  async createBooking(
    input: CreatePublicBookingInput | AdminCreateBookingInput,
    options?: { idempotencyKey?: string; isAdmin?: boolean }
  ): Promise<{ booking: BookingDto; deduplicated: boolean }> {
    const idemKey = options?.idempotencyKey?.trim();
    if (idemKey) {
      const existing = await this.repo.findByIdempotencyKey(idemKey);
      if (existing) {
        return { booking: toBookingDto(existing), deduplicated: true };
      }
    }

    const car = await this.repo.findCarById(input.carId);
    if (!car) {
      throw new AppError(404, "CAR_NOT_FOUND", "Unit mobil tidak ditemukan.");
    }
    if (car.status === "MAINTENANCE" || car.status === "INACTIVE") {
      throw new AppError(
        409,
        "CAR_UNAVAILABLE",
        `Unit ${car.name} sedang berstatus ${car.status} dan tidak dapat dipesan.`
      );
    }

    const totalDays = calculateInclusiveDays(input.startDate, input.endDate);
    if (totalDays <= 0) {
      throw new AppError(
        400,
        "INVALID_DATE_RANGE",
        "Tanggal selesai harus sama atau setelah tanggal mulai."
      );
    }

    const startDate = parseYyyyMmDdToUtc(input.startDate);
    const endDate = parseYyyyMmDdToUtc(input.endDate);

    // Cek ketersediaan berdasarkan unit fisik AVAILABLE (Opsi B)
    const units = await this.repo.findCarUnits(car.id);
    const availableUnits = units.filter((u) => u.status === "AVAILABLE");

    if (availableUnits.length > 0) {
      const preferred = availableUnits.filter(
        (u) => u.transmission === (input.transmissionPreference ?? "MANUAL")
      );
      const candidateUnits = preferred.length > 0 ? preferred : availableUnits;
      const busyIds = await this.repo.findBusyUnitIds({
        excludeBookingId: "",
        unitIds: candidateUnits.map((u) => u.id),
        startDate,
        endDate,
      });
      const hasFreeUnit = candidateUnits.some((u) => !busyIds.has(u.id));
      if (!hasFreeUnit) {
        throw new AppError(
          409,
          "SCHEDULE_CONFLICT",
          "Semua unit untuk pilihan transmisi tersebut sudah dipesan pada rentang tanggal yang dipilih."
        );
      }
    } else {
      throw new AppError(
        409,
        "CAR_UNAVAILABLE",
        `Belum ada unit fisik tersedia untuk ${car.name}.`
      );
    }

    const estimatedPrice = totalDays * Math.max(0, car.pricePerDay);
    const adminInput = options?.isAdmin
      ? (input as AdminCreateBookingInput)
      : undefined;
    const additionalFee = adminInput?.additionalFee ?? 0;
    const finalPrice =
      adminInput?.finalPrice !== undefined
        ? adminInput.finalPrice
        : estimatedPrice + additionalFee;

    const paymentScheme: PaymentScheme =
      input.paymentScheme === "DP_50" && canUseDownPayment(totalDays)
        ? "DP_50"
        : "FULL";

    const todayCompact = formatUtcDateYyyyMmDd(new Date()).replace(/-/g, "");
    const prefix = `BK-${todayCompact}-A`;

    for (let attempt = 0; attempt < 5; attempt++) {
      const count = await this.repo.countByCodePrefix(prefix);
      const seq = count + 1 + attempt;
      const bookingCode = `${prefix}${String(seq).padStart(3, "0")}`;

      try {
        const created = await this.repo.create({
          bookingCode,
          ...(idemKey ? { idempotencyKey: idemKey } : {}),
          carId: car.id,
          carNameSnapshot: car.name,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          startDate,
          endDate,
          totalDays,
          serviceType: input.serviceType,
          transmissionPreference: input.transmissionPreference ?? "MANUAL",
          pickupLocation: input.pickupLocation,
          customerNotes: input.customerNotes,
          pricePerDaySnapshot: car.pricePerDay,
          estimatedPrice,
          additionalFee,
          finalPrice,
          paymentScheme,
          paymentStatus: "UNPAID",
          paidAmount: 0,
          status: "PENDING",
          internalNote: adminInput?.internalNote ?? "",
        });
        return { booking: toBookingDto(created), deduplicated: false };
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          if (idemKey) {
            const raceExisting = await this.repo.findByIdempotencyKey(idemKey);
            if (raceExisting) {
              return { booking: toBookingDto(raceExisting), deduplicated: true };
            }
          }
          continue;
        }
        throw err;
      }
    }

    throw new AppError(
      500,
      "BOOKING_CODE_GENERATION_FAILED",
      "Gagal membuat kode booking unik. Silakan coba lagi."
    );
  }

  async getPublicByBookingCode(bookingCode: string): Promise<PublicBookingDto> {
    const found = await this.repo.findByBookingCode(bookingCode.toUpperCase());
    if (!found) {
      throw new AppError(404, "BOOKING_NOT_FOUND", "Kode booking tidak ditemukan.");
    }
    return toPublicBookingDto(found);
  }

  async listAdminBookings(query: ListBookingsQuery): Promise<BookingDto[]> {
    const rows = await this.repo.listAll({
      ...(query.status !== "ALL" ? { status: query.status } : {}),
      query: query.q,
    });
    return rows.map(toBookingDto);
  }

  async getAdminBookingById(id: string): Promise<BookingDto> {
    const found = await this.repo.findById(id);
    if (!found) {
      throw new AppError(404, "BOOKING_NOT_FOUND", "Data booking tidak ditemukan.");
    }
    return toBookingDto(found);
  }

  async updateBookingDetails(
    id: string,
    patch: UpdateBookingDetailsInput
  ): Promise<BookingDto> {
    const updated = await this.repo.transaction(async (tx) => {
      const target = await this.repo.findById(id, tx);
      if (!target) {
        throw new AppError(404, "BOOKING_NOT_FOUND", "Data booking tidak ditemukan.");
      }
      if (target.status !== "PENDING" && target.status !== "CONFIRMED") {
        throw new AppError(
          400,
          "BOOKING_NOT_EDITABLE",
          `Booking berstatus ${BOOKING_STATUS_LABELS[target.status]} tidak dapat diedit.`
        );
      }

      const nextCarId = patch.carId ?? target.carId;
      let carNameSnapshot = target.carNameSnapshot;
      let pricePerDay = target.pricePerDaySnapshot;

      if (patch.carId && patch.carId !== target.carId) {
        const car = await this.repo.findCarById(patch.carId, tx);
        if (!car) {
          throw new AppError(404, "CAR_NOT_FOUND", "Unit mobil tidak ditemukan.");
        }
        carNameSnapshot = car.name;
        pricePerDay = car.pricePerDay;
      }

      const startStr = patch.startDate ?? formatUtcDateYyyyMmDd(target.startDate);
      const endStr = patch.endDate ?? formatUtcDateYyyyMmDd(target.endDate);
      const totalDays = calculateInclusiveDays(startStr, endStr);
      if (totalDays <= 0) {
        throw new AppError(
          400,
          "INVALID_DATE_RANGE",
          "Tanggal selesai harus sama atau setelah tanggal mulai."
        );
      }

      const estimatedPrice = totalDays * pricePerDay;
      const additionalFee = patch.additionalFee ?? target.additionalFee;
      const wasOverridden =
        target.finalPrice !== target.estimatedPrice + target.additionalFee;
      const finalPrice =
        patch.finalPrice !== undefined
          ? patch.finalPrice
          : wasOverridden
            ? target.finalPrice
            : estimatedPrice + additionalFee;

      const startDate = parseYyyyMmDdToUtc(startStr);
      const endDate = parseYyyyMmDdToUtc(endStr);

      let nextCarUnitId = patch.carUnitId ?? target.carUnitId;
      let nextUnitLabel = target.carUnitLabelSnapshot;

      if (patch.carUnitId) {
        const chosenUnit = await this.repo.findUnitById(patch.carUnitId, tx);
        if (!chosenUnit || chosenUnit.carId !== nextCarId) {
          throw new AppError(
            400,
            "INVALID_CAR_UNIT",
            "Unit fisik tidak sesuai dengan model mobil."
          );
        }
        nextCarUnitId = chosenUnit.id;
        nextUnitLabel = `${chosenUnit.label} (${chosenUnit.plateNumber})`;
      }

      if (target.status === "CONFIRMED" && nextCarUnitId) {
        const conflict = await this.repo.findScheduleConflict(
          {
            excludeBookingId: target.id,
            carId: nextCarId,
            carUnitId: nextCarUnitId,
            startDate,
            endDate,
          },
          tx
        );
        if (conflict) {
          throw new AppError(
            409,
            "SCHEDULE_CONFLICT",
            `Jadwal bentrok dengan ${conflict.bookingCode}.`
          );
        }
      }

      return this.repo.update(
        id,
        {
          ...(patch.customerName !== undefined
            ? { customerName: patch.customerName }
            : {}),
          ...(patch.customerPhone !== undefined
            ? { customerPhone: patch.customerPhone }
            : {}),
          car: { connect: { id: nextCarId } },
          ...(nextCarUnitId
            ? {
                carUnit: { connect: { id: nextCarUnitId } },
                carUnitLabelSnapshot: nextUnitLabel,
              }
            : {}),
          carNameSnapshot,
          pricePerDaySnapshot: pricePerDay,
          startDate,
          endDate,
          totalDays,
          ...(patch.serviceType !== undefined
            ? { serviceType: patch.serviceType }
            : {}),
          ...(patch.transmissionPreference !== undefined
            ? { transmissionPreference: patch.transmissionPreference }
            : {}),
          estimatedPrice,
          additionalFee,
          finalPrice,
          ...(patch.internalNote !== undefined
            ? { internalNote: patch.internalNote }
            : {}),
        },
        tx
      );
    });

    return toBookingDto(updated);
  }

  async transitionStatus(
    id: string,
    input: UpdateBookingStatusInput
  ): Promise<BookingDto> {
    const updated = await this.repo.transaction(async (tx) => {
      const target = await this.repo.findById(id, tx);
      if (!target) {
        throw new AppError(404, "BOOKING_NOT_FOUND", "Data booking tidak ditemukan.");
      }

      if (!canTransitionStatus(target.status, input.status)) {
        throw new AppError(
          400,
          "INVALID_STATUS_TRANSITION",
          `Status ${BOOKING_STATUS_LABELS[target.status]} tidak dapat diubah ke ${BOOKING_STATUS_LABELS[input.status]}.`
        );
      }

      let assignedUnitId: string | undefined;
      let assignedUnitLabel: string | undefined;

      if (input.status === "CONFIRMED") {
        const car = await this.repo.findCarById(target.carId, tx);
        if (!car || car.status === "MAINTENANCE" || car.status === "INACTIVE") {
          throw new AppError(
            409,
            "CAR_UNAVAILABLE",
            "Unit sedang dalam perawatan atau nonaktif."
          );
        }

        const units = await this.repo.findCarUnits(target.carId, tx);
        const availableUnits = units.filter((u) => u.status === "AVAILABLE");

        if (input.carUnitId) {
          const chosen = availableUnits.find((u) => u.id === input.carUnitId);
          if (!chosen) {
            throw new AppError(
              409,
              "CAR_UNAVAILABLE",
              "Unit fisik yang dipilih tidak tersedia atau sedang perawatan."
            );
          }
          const conflict = await this.repo.findScheduleConflict(
            {
              excludeBookingId: target.id,
              carId: target.carId,
              carUnitId: chosen.id,
              startDate: target.startDate,
              endDate: target.endDate,
            },
            tx
          );
          if (conflict) {
            throw new AppError(
              409,
              "SCHEDULE_CONFLICT",
              `Jadwal unit ${chosen.label} (${chosen.plateNumber}) bentrok dengan ${conflict.bookingCode}.`
            );
          }
          assignedUnitId = chosen.id;
          assignedUnitLabel = `${chosen.label} (${chosen.plateNumber})`;
        } else {
          // Auto-assign free AVAILABLE unit (prefer matching transmissionPreference)
          const busyIds = await this.repo.findBusyUnitIds(
            {
              excludeBookingId: target.id,
              unitIds: availableUnits.map((u) => u.id),
              startDate: target.startDate,
              endDate: target.endDate,
            },
            tx
          );
          const freeUnits = availableUnits.filter((u) => !busyIds.has(u.id));
          const picked =
            freeUnits.find(
              (u) => u.transmission === target.transmissionPreference
            ) ?? freeUnits[0];

          if (!picked) {
            throw new AppError(
              409,
              "SCHEDULE_CONFLICT",
              "Semua unit fisik untuk model ini sudah dipesan pada tanggal tersebut."
            );
          }
          assignedUnitId = picked.id;
          assignedUnitLabel = `${picked.label} (${picked.plateNumber})`;
        }
      }

      if (input.status === "COMPLETED") {
        const payment = computePaymentSummary(
          target.finalPrice,
          target.paymentScheme,
          target.paymentStatus,
          target.paidAmount
        );
        if (payment.paymentStatus !== "PAID" || payment.remainingAmount > 0) {
          throw new AppError(
            409,
            "PAYMENT_REQUIRED",
            "Lunasi pembayaran terlebih dahulu sebelum menandai booking selesai."
          );
        }
      }

      return this.repo.update(
        id,
        {
          status: input.status,
          ...(assignedUnitId
            ? {
                carUnit: { connect: { id: assignedUnitId } },
                carUnitLabelSnapshot: assignedUnitLabel,
              }
            : {}),
          ...(input.finalPrice !== undefined
            ? { finalPrice: input.finalPrice }
            : {}),
          ...(input.internalNote !== undefined
            ? { internalNote: input.internalNote }
            : {}),
        },
        tx
      );
    });

    return toBookingDto(updated);
  }

  async updatePayment(
    id: string,
    input: UpdateBookingPaymentInput
  ): Promise<BookingDto> {
    const target = await this.repo.findById(id);
    if (!target) {
      throw new AppError(404, "BOOKING_NOT_FOUND", "Data booking tidak ditemukan.");
    }

    if (
      target.status === "COMPLETED" ||
      target.status === "REJECTED" ||
      target.status === "CANCELLED"
    ) {
      throw new AppError(
        400,
        "BOOKING_FINALIZED",
        "Status pembayaran tidak dapat diubah pada booking yang sudah selesai, ditolak, atau dibatalkan."
      );
    }

    const effectiveScheme: PaymentScheme = canUseDownPayment(target.totalDays)
      ? input.paymentScheme
      : "FULL";
    const effectiveStatus: PaymentStatus =
      target.status === "PENDING" ? "UNPAID" : input.paymentStatus;

    if (target.status !== "PENDING" && effectiveStatus !== target.paymentStatus) {
      const allowed = getAllowedPaymentStatuses(
        target.status,
        effectiveScheme,
        target.paymentStatus
      );
      if (!allowed.includes(effectiveStatus)) {
        throw new AppError(
          400,
          "PAYMENT_REGRESSION_FORBIDDEN",
          "Status pembayaran tidak dapat dikembalikan ke tahap sebelumnya saat sewa sedang jalan."
        );
      }
    }

    const summary = computePaymentSummary(
      target.finalPrice,
      effectiveScheme,
      effectiveStatus
    );

    const updated = await this.repo.update(id, {
      paymentScheme: summary.paymentScheme,
      paymentStatus: summary.paymentStatus,
      paidAmount: summary.paidAmount,
    });

    return toBookingDto(updated);
  }

  async extendBooking(
    id: string,
    input: ExtendBookingInput
  ): Promise<BookingDto> {
    const updated = await this.repo.transaction(async (tx) => {
      const target = await this.repo.findById(id, tx);
      if (!target) {
        throw new AppError(404, "BOOKING_NOT_FOUND", "Data booking tidak ditemukan.");
      }
      if (target.status !== "IN_PROGRESS") {
        throw new AppError(
          400,
          "EXTEND_NOT_ALLOWED",
          "Perpanjang sewa hanya tersedia untuk booking berstatus Sedang Jalan."
        );
      }

      const currentEndStr = formatUtcDateYyyyMmDd(target.endDate);
      if (input.newEndDate <= currentEndStr) {
        throw new AppError(
          400,
          "INVALID_DATE_RANGE",
          "Tanggal selesai baru harus setelah tanggal selesai saat ini."
        );
      }

      const startStr = formatUtcDateYyyyMmDd(target.startDate);
      const totalDays = calculateInclusiveDays(startStr, input.newEndDate);
      const dailyRate = target.pricePerDaySnapshot;
      const estimatedPrice = totalDays * dailyRate;
      const extraDays = totalDays - target.totalDays;
      const wasOverridden =
        target.finalPrice !== target.estimatedPrice + target.additionalFee;
      const finalPrice =
        input.overrideFinalPrice !== undefined
          ? input.overrideFinalPrice
          : wasOverridden
            ? target.finalPrice + extraDays * dailyRate
            : estimatedPrice + target.additionalFee;

      const prevPaid = computePaymentSummary(
        target.finalPrice,
        target.paymentScheme,
        target.paymentStatus,
        target.paidAmount
      ).paidAmount;

      let nextPaymentStatus: PaymentStatus = target.paymentStatus;
      if (nextPaymentStatus === "PAID" && finalPrice > prevPaid) {
        nextPaymentStatus = prevPaid > 0 ? "DP_PAID" : "UNPAID";
      }

      const newEndDate = parseYyyyMmDdToUtc(input.newEndDate);
      const conflict = await this.repo.findScheduleConflict(
        {
          excludeBookingId: target.id,
          carId: target.carId,
          carUnitId: target.carUnitId,
          startDate: target.startDate,
          endDate: newEndDate,
        },
        tx
      );
      if (conflict) {
        throw new AppError(
          409,
          "SCHEDULE_CONFLICT",
          `Perpanjangan bentrok dengan ${conflict.bookingCode} (${conflict.customerName}).`
        );
      }

      return this.repo.update(
        id,
        {
          endDate: newEndDate,
          totalDays,
          estimatedPrice,
          finalPrice,
          paymentStatus: nextPaymentStatus,
          paidAmount: prevPaid,
        },
        tx
      );
    });

    return toBookingDto(updated);
  }
}
