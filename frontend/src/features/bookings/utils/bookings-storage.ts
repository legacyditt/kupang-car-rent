import { INITIAL_CARS } from "@/features/cars/data/cars.mock";
import type { CarItem } from "@/features/cars/types/car.types";
import { INITIAL_BOOKINGS } from "../data/bookings.mock";
import type { BookingItem } from "../types/booking.types";

export const BOOKINGS_STORAGE_KEY = "aventra-admin-bookings";
export const BOOKINGS_UPDATED_EVENT = "aventra:bookings-updated";
const CARS_STORAGE_KEY = "aventra-admin-cars";

export function readStoredBookings(): BookingItem[] {
  try {
    const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return INITIAL_BOOKINGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function writeStoredBookings(bookings: BookingItem[]): void {
  try {
    window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent(BOOKINGS_UPDATED_EVENT));
  } catch {
    // Ignore storage write failure in restricted contexts
  }
}

export function subscribeStoredBookings(onChange: () => void): () => void {
  const handleCustom = () => onChange();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === BOOKINGS_STORAGE_KEY) onChange();
  };

  window.addEventListener(BOOKINGS_UPDATED_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(BOOKINGS_UPDATED_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

export function readStoredCars(): CarItem[] {
  try {
    const raw = window.localStorage.getItem(CARS_STORAGE_KEY);
    if (!raw) return INITIAL_CARS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CARS;
  } catch {
    return INITIAL_CARS;
  }
}

