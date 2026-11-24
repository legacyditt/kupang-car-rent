import type {
  CarStatus,
  CarUnit,
  TransmissionPreference,
} from "../../generated/prisma/client.js";
import { AppError } from "../../utils/AppError.js";
import {
  formatUtcDateDdMmYyyy,
  parseYyyyMmDdToUtc,
} from "../../utils/date.js";
import { CarRepository, type CarWithUnits } from "./car.repository.js";
import type {
  AvailabilityQuery,
  CreateCarInput,
  CreateCarUnitInput,
  UpdateCarInput,
  UpdateCarUnitInput,
} from "./car.schema.js";

export interface CarUnitDto {
  id: string;
  carId: string;
  label: string;
  plateNumber: string;
  transmission: TransmissionPreference;
  status: CarStatus;
}

export interface BookedDatesByTransmission {
  MATIC: string[];
  MANUAL: string[];
}

export interface CarDto {
  id: string;
  slug: string;
  name: string;
  brand: string;
  transmission: string;
  description: string | null;
  capacityLabel: string;
  pricePerDay: number;
  imageUrl: string;
  status: CarStatus;
  bookedDates: string[];
  bookedDatesByTransmission: BookedDatesByTransmission;
  units?: CarUnitDto[];
}

function createCarSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function expandRangeKeys(startDate: Date, endDate: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    )
  );
  const end = new Date(
    Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate()
    )
  );
  while (cursor <= end) {
    keys.push(formatUtcDateDdMmYyyy(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

function computeModelCalendarBlocks(
  units: CarUnit[],
  ranges: Array<{
    carUnitId: string | null;
    startDate: Date;
    endDate: Date;
  }>
): {
  bookedDates: string[];
  bookedDatesByTransmission: BookedDatesByTransmission;
} {
  const availableUnits = units.filter((u) => u.status === "AVAILABLE");
  const availUnitMap = new Map(availableUnits.map((u) => [u.id, u]));

  const dateBookedUnits = new Map<string, Set<string>>();
  for (const r of ranges) {
    // Fallback: if a legacy confirmed booking has no carUnitId, count it against first available unit
    const unitId = r.carUnitId ?? availableUnits[0]?.id;
    if (!unitId || !availUnitMap.has(unitId)) continue;

    for (const dateKey of expandRangeKeys(r.startDate, r.endDate)) {
      const set = dateBookedUnits.get(dateKey) ?? new Set<string>();
      set.add(unitId);
      dateBookedUnits.set(dateKey, set);
    }
  }

  const maticUnits = availableUnits.filter((u) => u.transmission === "MATIC");
  const manualUnits = availableUnits.filter((u) => u.transmission === "MANUAL");

  const bookedDates: string[] = [];
  const maticBlocked: string[] = [];
  const manualBlocked: string[] = [];

  for (const [dateKey, bookedSet] of dateBookedUnits.entries()) {
    if (availableUnits.length > 0 && bookedSet.size >= availableUnits.length) {
      bookedDates.push(dateKey);
    }
    if (
      maticUnits.length > 0 &&
      maticUnits.every((u) => bookedSet.has(u.id))
    ) {
      maticBlocked.push(dateKey);
    }
    if (
      manualUnits.length > 0 &&
      manualUnits.every((u) => bookedSet.has(u.id))
    ) {
      manualBlocked.push(dateKey);
    }
  }

  return {
    bookedDates,
    bookedDatesByTransmission: {
      MATIC: maticBlocked,
      MANUAL: manualBlocked,
    },
  };
}

function toUnitDto(u: CarUnit): CarUnitDto {
  return {
    id: u.id,
    carId: u.carId,
    label: u.label,
    plateNumber: u.plateNumber,
    transmission: u.transmission,
    status: u.status,
  };
}

function toCarDto(
  car: CarWithUnits,
  ranges: Array<{ carUnitId: string | null; startDate: Date; endDate: Date }>,
  includeUnits: boolean
): CarDto {
  const blocks = computeModelCalendarBlocks(car.units, ranges);
  return {
    id: car.id,
    slug: car.slug,
    name: car.name,
    brand: car.brand,
    transmission: car.transmission,
    description: car.description,
    capacityLabel: car.capacityLabel,
    pricePerDay: car.pricePerDay,
    imageUrl: car.imageUrl,
    status: car.status,
    bookedDates: blocks.bookedDates,
    bookedDatesByTransmission: blocks.bookedDatesByTransmission,
    ...(includeUnits ? { units: car.units.map(toUnitDto) } : {}),
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
      Array<{ carUnitId: string | null; startDate: Date; endDate: Date }>
    >();
    for (const r of ranges) {
      const list = rangesByCar.get(r.carId) ?? [];
      list.push({
        carUnitId: r.carUnitId,
        startDate: r.startDate,
        endDate: r.endDate,
      });
      rangesByCar.set(r.carId, list);
    }

    // Public list (includeInactive=false) MUST NOT expose physical units / plate numbers.
    return cars.map((car) =>
      toCarDto(car, rangesByCar.get(car.id) ?? [], includeInactive)
    );
  }

  async checkAvailability(
    slug: string,
    query: AvailabilityQuery
  ): Promise<{ available: boolean; availableUnitCount?: number; reason?: string }> {
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

    const matchingUnits = car.units.filter(
      (u) =>
        u.status === "AVAILABLE" &&
        (!query.transmission || u.transmission === query.transmission)
    );

    if (matchingUnits.length === 0) {
      return {
        available: false,
        availableUnitCount: 0,
        reason: "Tidak ada unit fisik tersedia untuk tipe transmisi tersebut.",
      };
    }

    const start = parseYyyyMmDdToUtc(query.startDate);
    const end = parseYyyyMmDdToUtc(query.endDate);
    const busyIds = new Set(
      await this.repo.findConflictingUnitIds(
        matchingUnits.map((u) => u.id),
        start,
        end
      )
    );

    const freeCount = matchingUnits.filter((u) => !busyIds.has(u.id)).length;
    if (freeCount === 0) {
      return {
        available: false,
        availableUnitCount: 0,
        reason: "Semua unit pada rentang tanggal tersebut sudah dipesan.",
      };
    }

    return { available: true, availableUnitCount: freeCount };
  }

  async createCar(input: CreateCarInput): Promise<CarDto> {
    const baseSlug = createCarSlug(input.name) || `unit-${Date.now()}`;
    const existing = await this.repo.findBySlug(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const plateNumber =
      input.plateNumber?.trim().toUpperCase() ||
      `DH-${Date.now().toString().slice(-6)}`;

    const created = await this.repo.createWithInitialUnit(
      {
        slug,
        name: input.name,
        brand: input.brand,
        transmission: input.transmission,
        description: input.description,
        capacityLabel: input.capacityLabel,
        pricePerDay: input.pricePerDay,
        imageUrl: input.imageUrl,
        status: input.status,
      },
      {
        label: `${input.name} #1`,
        plateNumber,
        transmission: input.transmission === "MATIC" ? "MATIC" : "MANUAL",
        status: input.status === "INACTIVE" ? "INACTIVE" : "AVAILABLE",
      }
    );

    return toCarDto(created, [], true);
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
    return toCarDto(updated, ranges, true);
  }

  async updateCarStatus(id: string, status: CarStatus): Promise<CarDto> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppError(404, "CAR_NOT_FOUND", "Unit mobil tidak ditemukan.");
    }

    const updated = await this.repo.update(id, { status });
    const ranges = await this.repo.findActiveBookingRangesByCarIds([updated.id]);
    return toCarDto(updated, ranges, true);
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

  async addUnit(carId: string, input: CreateCarUnitInput): Promise<CarUnitDto> {
    const car = await this.repo.findById(carId);
    if (!car) {
      throw new AppError(404, "CAR_NOT_FOUND", "Model mobil tidak ditemukan.");
    }

    const unit = await this.repo.createUnit({
      carId,
      label: input.label,
      plateNumber: input.plateNumber,
      transmission: input.transmission,
      status: input.status,
    });
    return toUnitDto(unit);
  }

  async updateUnit(
    unitId: string,
    input: UpdateCarUnitInput
  ): Promise<CarUnitDto> {
    const current = await this.repo.findUnitById(unitId);
    if (!current) {
      throw new AppError(404, "UNIT_NOT_FOUND", "Unit fisik tidak ditemukan.");
    }

    const updated = await this.repo.updateUnit(unitId, {
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.plateNumber !== undefined
        ? { plateNumber: input.plateNumber }
        : {}),
      ...(input.transmission !== undefined
        ? { transmission: input.transmission }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });
    return toUnitDto(updated);
  }

  async deleteUnit(unitId: string): Promise<void> {
    const current = await this.repo.findUnitById(unitId);
    if (!current) {
      throw new AppError(404, "UNIT_NOT_FOUND", "Unit fisik tidak ditemukan.");
    }

    const bookingCount = await this.repo.countUnitBookings(unitId);
    if (bookingCount > 0) {
      throw new AppError(
        409,
        "UNIT_HAS_BOOKINGS",
        "Unit fisik yang sudah memiliki riwayat booking tidak dapat dihapus. Ubah status menjadi INACTIVE."
      );
    }

    await this.repo.deleteUnit(unitId);
  }
}
