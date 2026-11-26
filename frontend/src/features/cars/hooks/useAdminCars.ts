import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";
import { INITIAL_CARS } from "../data/cars.mock";
import type { CarItem, CarStatus, CarUnitItem } from "../types/car.types";
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

    try {
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
      notifySuccess(
        payload.id ? "Unit armada diperbarui" : "Unit armada ditambahkan"
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal menyimpan unit armada.";
      notifyError("Gagal menyimpan armada", message);
      throw err;
    }
  };

  const changeCarStatus = async (carId: string, status: CarStatus) => {
    try {
      await apiFetch<CarItem>(`/admin/cars/${carId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await invalidateCars();
      notifySuccess("Status armada diperbarui");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Gagal mengubah status armada.";
      notifyError("Gagal mengubah status armada", message);
      throw err;
    }
  };

  const addCarUnit = async (
    carId: string,
    input: {
      label: string;
      plateNumber: string;
      transmission: "MATIC" | "MANUAL";
      status?: CarStatus;
    }
  ) => {
    try {
      await apiFetch<CarUnitItem>(`/admin/cars/${carId}/units`, {
        method: "POST",
        body: JSON.stringify(input),
      });
      await invalidateCars();
      notifySuccess("Unit fisik ditambahkan");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal menambahkan unit fisik.";
      notifyError("Gagal menambahkan unit fisik", message);
      throw err;
    }
  };

  const updateCarUnit = async (
    unitId: string,
    input: Partial<{
      label: string;
      plateNumber: string;
      transmission: "MATIC" | "MANUAL";
      status: CarStatus;
    }>
  ) => {
    try {
      await apiFetch<CarUnitItem>(`/admin/car-units/${unitId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      await invalidateCars();
      notifySuccess("Unit fisik diperbarui");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal memperbarui unit fisik.";
      notifyError("Gagal memperbarui unit fisik", message);
      throw err;
    }
  };

  const deleteCarUnit = async (unitId: string) => {
    try {
      await apiFetch(`/admin/car-units/${unitId}`, {
        method: "DELETE",
      });
      await invalidateCars();
      notifySuccess("Unit fisik dihapus");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal menghapus unit fisik.";
      notifyError("Gagal menghapus unit fisik", message);
      throw err;
    }
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
    addCarUnit,
    updateCarUnit,
    deleteCarUnit,
  };
}
