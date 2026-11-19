import { useEffect, useMemo, useState } from "react";
import { INITIAL_CARS } from "../data/cars.mock";
import type { CarItem, CarStatus } from "../types/car.types";
import {
  countCarsByStatus,
  filterCarsByStatus,
  updateCarStatus,
  upsertCar,
  type CarFilterTab,
  type CarFormPayload,
} from "../utils/car-admin";

const STORAGE_KEY = "aventra-admin-cars";

function loadInitialCars(): CarItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CARS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CARS;
  } catch {
    return INITIAL_CARS;
  }
}

export function useAdminCars() {
  const [cars, setCars] = useState<CarItem[]>(loadInitialCars);
  const [activeTab, setActiveTab] = useState<CarFilterTab>("ALL");

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
    } catch {
      // Ignore storage write failure in restricted contexts
    }
  }, [cars]);

  const counts = useMemo(() => countCarsByStatus(cars), [cars]);
  const filteredCars = useMemo(
    () => filterCarsByStatus(cars, activeTab),
    [cars, activeTab]
  );

  const saveCar = (payload: CarFormPayload) => {
    setCars((prev) => upsertCar(prev, payload));
  };

  const changeCarStatus = (carId: string, status: CarStatus) => {
    setCars((prev) => updateCarStatus(prev, carId, status));
  };

  return {
    cars,
    filteredCars,
    counts,
    activeTab,
    setActiveTab,
    saveCar,
    changeCarStatus,
  };
}

