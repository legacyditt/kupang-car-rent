import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { INITIAL_CARS } from "../data/cars.mock";
import type { CarItem, CarStatus } from "../types/car.types";
import {
  countCarsByStatus,
  filterCarsByStatus,
  type CarFilterTab,
  type CarFormPayload,
} from "../utils/car-admin";

export const PUBLIC_CARS_QUERY_KEY = ["public-cars"] as const;
export const ADMIN_CARS_QUERY_KEY = ["admin-cars"] as const;

export function usePublicCars() {
  return useQuery({
    queryKey: PUBLIC_CARS_QUERY_KEY,
    queryFn: () => apiFetch<CarItem[]>("/cars"),
    placeholderData: INITIAL_CARS,
  });
}

export function useAdminCars() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<CarFilterTab>("ALL");

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ADMIN_CARS_QUERY_KEY,
    queryFn: () => apiFetch<CarItem[]>("/admin/cars"),
  });

  const counts = useMemo(() => countCarsByStatus(cars), [cars]);
  const filteredCars = useMemo(
    () => filterCarsByStatus(cars, activeTab),
    [cars, activeTab]
  );

  const invalidateCars = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ADMIN_CARS_QUERY_KEY }),
      qc.invalidateQueries({ queryKey: PUBLIC_CARS_QUERY_KEY }),
    ]);
  };

  const saveCar = async (payload: CarFormPayload) => {
    const body = {
      name: payload.name,
      transmission: payload.transmission,
      capacityLabel: payload.capacityLabel,
      pricePerDay: payload.pricePerDay,
      imageUrl: payload.imageUrl,
      status: payload.status,
    };

    if (payload.id) {
      await apiFetch<CarItem>(`/admin/cars/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    } else {
      await apiFetch<CarItem>("/admin/cars", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await invalidateCars();
  };

  const changeCarStatus = async (carId: string, status: CarStatus) => {
    await apiFetch<CarItem>(`/admin/cars/${carId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await invalidateCars();
  };

  return {
    cars,
    isLoading,
    filteredCars,
    counts,
    activeTab,
    setActiveTab,
    saveCar,
    changeCarStatus,
  };
}
