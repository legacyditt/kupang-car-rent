import type { Car, CarStatus } from "../../generated/prisma/client.js";
import { AppError } from "../../utils/AppError.js";
import {
  expandBookedDatesDdMmYyyy,
  parseYyyyMmDdToUtc,
} from "../../utils/date.js";
import { CarRepository } from "./car.repository.js";
import type {
  AvailabilityQuery,
  CreateCarInput,
  UpdateCarInput,
} from "./car.schema.js";

export interface CarDto {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string | null;
  transmission: string;
  description: string | null;
  capacityLabel: string;
  pricePerDay: number;
  imageUrl: string;
  status: CarStatus;
  bookedDates: string[];
}

function createCarSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toCarDto(car: Car, bookedDates: string[]): CarDto {
  return {
    id: car.id,
    slug: car.slug,
    name: car.name,
    brand: car.brand,
    category: car.category,
    transmission: car.transmission,
    description: car.description,
    capacityLabel: car.capacityLabel,
    pricePerDay: car.pricePerDay,
    imageUrl: car.imageUrl,
    status: car.status,
    bookedDates,
  };
}

export class CarService {
  constructor(private readonly repo: CarRepository) {}

  async listCars(includeInactive: boolean): Promise<CarDto[]> {
    const cars = await this.repo.findAll(includeInactive);
    const ranges = await this.repo.findActiveBookingRangesByCarIds(
      cars.map((c) => c.id)
    );

    const rangesByCar = new Map<
      string,
      Array<{ startDate: Date; endDate: Date }>
    >();
    for (const r of ranges) {
      const list = rangesByCar.get(r.carId) ?? [];
      list.push({ startDate: r.startDate, endDate: r.endDate });
      rangesByCar.set(r.carId, list);
    }

    return cars.map((car) =>
      toCarDto(car, expandBookedDatesDdMmYyyy(rangesByCar.get(car.id) ?? []))
    );
  }

  async checkAvailability(
    slug: string,
    query: AvailabilityQuery
  ): Promise<{ available: boolean; reason?: string }> {
    const car = await this.repo.findBySlug(slug);
    if (!car) {
      throw new AppError(404, "CAR_NOT_FOUND", "Unit mobil tidak ditemukan.");
    }

    if (car.status === "MAINTENANCE" || car.status === "INACTIVE") {
      return {
        available: false,
        reason: `Unit sedang berstatus ${car.status}.`,
      };
    }

    const start = parseYyyyMmDdToUtc(query.startDate);
    const end = parseYyyyMmDdToUtc(query.endDate);
    const conflict = await this.repo.findConflictingBooking(car.id, start, end);

    if (conflict) {
      return {
        available: false,
        reason: "Unit sudah dipesan pada rentang tanggal tersebut.",
      };
    }

    return { available: true };
  }

  async createCar(input: CreateCarInput): Promise<CarDto> {
    const baseSlug = createCarSlug(input.name) || `unit-${Date.now()}`;
    const existing = await this.repo.findBySlug(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const created = await this.repo.create({
      slug,
      name: input.name,
      brand: input.brand,
      category: input.category,
      transmission: input.transmission,
      description: input.description,
      capacityLabel: input.capacityLabel,
      pricePerDay: input.pricePerDay,
      imageUrl: input.imageUrl,
      status: input.status,
    });

    return toCarDto(created, []);
  }

  async updateCar(id: string, input: UpdateCarInput): Promise<CarDto> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppError(404, "CAR_NOT_FOUND", "Unit mobil tidak ditemukan.");
    }

    let nextSlug: string | undefined;
    if (input.name && input.name !== current.name) {
      const candidate = createCarSlug(input.name);
      if (candidate && candidate !== current.slug) {
        const conflict = await this.repo.findBySlug(candidate);
        nextSlug = conflict
          ? `${candidate}-${Date.now().toString(36)}`
          : candidate;
      }
    }

    const updated = await this.repo.update(id, {
      ...(nextSlug ? { slug: nextSlug } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.brand !== undefined ? { brand: input.brand } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.transmission !== undefined
        ? { transmission: input.transmission }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.capacityLabel !== undefined
        ? { capacityLabel: input.capacityLabel }
        : {}),
      ...(input.pricePerDay !== undefined
        ? { pricePerDay: input.pricePerDay }
        : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });

    const ranges = await this.repo.findActiveBookingRangesByCarIds([updated.id]);
    return toCarDto(updated, expandBookedDatesDdMmYyyy(ranges));
  }

  async updateCarStatus(id: string, status: CarStatus): Promise<CarDto> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppError(404, "CAR_NOT_FOUND", "Unit mobil tidak ditemukan.");
    }

    const updated = await this.repo.update(id, { status });
    const ranges = await this.repo.findActiveBookingRangesByCarIds([updated.id]);
    return toCarDto(updated, expandBookedDatesDdMmYyyy(ranges));
  }

  async deleteCar(id: string): Promise<void> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppError(404, "CAR_NOT_FOUND", "Unit mobil tidak ditemukan.");
    }

    const bookingCount = await this.repo.countBookings(id);
    if (bookingCount > 0) {
      throw new AppError(
        409,
        "CAR_HAS_BOOKINGS",
        "Unit yang sudah memiliki riwayat booking tidak dapat dihapus permanen. Ubah status menjadi INACTIVE."
      );
    }

    await this.repo.delete(id);
  }
}

