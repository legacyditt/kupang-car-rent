import type { CarItem, CarStatus, CarTransmission } from "../types/car.types";

export type CarFilterTab = "ALL" | CarStatus;

export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
  AVAILABLE: "Tersedia",
  RENTED: "Sedang Disewa",
  MAINTENANCE: "Perawatan",
  INACTIVE: "Nonaktif",
};

export const CAR_TRANSMISSION_LABELS: Record<CarTransmission, string> = {
  MATIC: "Matic",
  MANUAL: "Manual",
  BOTH: "Matic / Manual",
};

export interface CarFormPayload {
  id?: string;
  name: string;
  transmission: CarTransmission;
  capacityLabel: string;
  pricePerDay: number;
  imageUrl: string;
  status: CarStatus;
}

export function createCarSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function filterCarsByStatus(
  cars: CarItem[],
  filter: CarFilterTab
): CarItem[] {
  if (filter === "ALL") return cars;
  return cars.filter((car) => car.status === filter);
}

export function countCarsByStatus(
  cars: CarItem[]
): Record<CarFilterTab, number> {
  return cars.reduce<Record<CarFilterTab, number>>(
    (acc, car) => {
      acc.ALL += 1;
      acc[car.status] += 1;
      return acc;
    },
    { ALL: 0, AVAILABLE: 0, RENTED: 0, MAINTENANCE: 0, INACTIVE: 0 }
  );
}

export function upsertCar(
  cars: CarItem[],
  payload: CarFormPayload
): CarItem[] {
  const slug = createCarSlug(payload.name);

  if (payload.id) {
    return cars.map((car) =>
      car.id === payload.id
        ? {
            ...car,
            slug,
            name: payload.name.trim(),
            transmission: payload.transmission,
            capacityLabel: payload.capacityLabel.trim() || "— Kursi",
            pricePerDay: payload.pricePerDay,
            imageUrl: payload.imageUrl.trim() || "/Toyota Avanza.jpg",
            status: payload.status,
          }
        : car
    );
  }

  const newCar: CarItem = {
    id: `car-${slug}-${Date.now()}`,
    slug,
    name: payload.name.trim(),
    transmission: payload.transmission,
    capacityLabel: payload.capacityLabel.trim() || "— Kursi",
    pricePerDay: payload.pricePerDay,
    imageUrl: payload.imageUrl.trim() || "/Toyota Avanza.jpg",
    status: payload.status,
  };

  return [...cars, newCar];
}

export function updateCarStatus(
  cars: CarItem[],
  carId: string,
  status: CarStatus
): CarItem[] {
  return cars.map((car) => (car.id === carId ? { ...car, status } : car));
}

