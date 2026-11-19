import assert from "node:assert/strict";
import test from "node:test";
import {
  countCarsByStatus,
  createCarSlug,
  filterCarsByStatus,
  updateCarStatus,
  upsertCar,
} from "../src/features/cars/utils/car-admin.ts";

const SAMPLE_CARS = [
  {
    id: "car-1",
    slug: "toyota-avanza",
    name: "Toyota Avanza",
    brand: "Toyota",
    imageUrl: "/Toyota Avanza.jpg",
    capacityLabel: "7 Kursi",
    pricePerDay: 300000,
    status: "AVAILABLE",
  },
  {
    id: "car-2",
    slug: "toyota-hilux",
    name: "Toyota Hilux",
    brand: "Toyota",
    imageUrl: "/Toyota Hilux.jpg",
    capacityLabel: "5 Kursi",
    pricePerDay: 300000,
    status: "MAINTENANCE",
  },
];

test("createCarSlug normalizes car name into URL slug", () => {
  assert.equal(createCarSlug("Toyota Innova Reborn!"), "toyota-innova-reborn");
});

test("filterCarsByStatus returns all or matching status", () => {
  assert.equal(filterCarsByStatus(SAMPLE_CARS, "ALL").length, 2);
  assert.equal(filterCarsByStatus(SAMPLE_CARS, "MAINTENANCE").length, 1);
  assert.equal(filterCarsByStatus(SAMPLE_CARS, "RENTED").length, 0);
});

test("countCarsByStatus counts each status accurately", () => {
  const counts = countCarsByStatus(SAMPLE_CARS);
  assert.deepEqual(counts, {
    ALL: 2,
    AVAILABLE: 1,
    RENTED: 0,
    MAINTENANCE: 1,
    INACTIVE: 0,
  });
});

test("upsertCar updates existing car and appends new car", () => {
  const updated = upsertCar(SAMPLE_CARS, {
    id: "car-1",
    name: "Toyota Avanza Veloz",
    brand: "Toyota",
    capacityLabel: "7 Kursi",
    pricePerDay: 350000,
    imageUrl: "/Toyota Avanza.jpg",
    status: "AVAILABLE",
  });
  assert.equal(updated.length, 2);
  assert.equal(updated[0].pricePerDay, 350000);
  assert.equal(updated[0].slug, "toyota-avanza-veloz");

  const added = upsertCar(updated, {
    name: "Honda Brio RS",
    brand: "Honda",
    capacityLabel: "5 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Honda Brio.jpeg",
    status: "AVAILABLE",
  });
  assert.equal(added.length, 3);
  assert.equal(added[2].slug, "honda-brio-rs");
});

test("updateCarStatus updates target car status immutably", () => {
  const next = updateCarStatus(SAMPLE_CARS, "car-1", "RENTED");
  assert.equal(next[0].status, "RENTED");
  assert.equal(SAMPLE_CARS[0].status, "AVAILABLE");
});

