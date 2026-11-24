import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCarCard } from "@/features/cars/components/AdminCarCard";
import { CarFormDialog } from "@/features/cars/components/CarFormDialog";
import { useAdminCars } from "@/features/cars/hooks/useAdminCars";
import type { CarItem } from "@/features/cars/types/car.types";
import {
  CAR_STATUS_LABELS,
  type CarFilterTab,
} from "@/features/cars/utils/car-admin";

const FILTER_TABS: Array<{ value: CarFilterTab; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "AVAILABLE", label: CAR_STATUS_LABELS.AVAILABLE },
  { value: "RENTED", label: CAR_STATUS_LABELS.RENTED },
  { value: "MAINTENANCE", label: CAR_STATUS_LABELS.MAINTENANCE },
  { value: "INACTIVE", label: CAR_STATUS_LABELS.INACTIVE },
];

export function AdminCarsPage() {
  const {
    filteredCars,
    counts,
    activeTab,
    setActiveTab,
    saveCar,
    changeCarStatus,
  } = useAdminCars();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarItem | null>(null);

  const openCreate = () => {
    setEditingCar(null);
    setDialogOpen(true);
  };

  const openEdit = (car: CarItem) => {
    setEditingCar(car);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
            Manajemen Kendaraan
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Unit &amp; Tarif Sewa.
          </h1>
        </div>

        <Button
          type="button"
          variant="accent"
          onClick={openCreate}
          className="h-10 rounded-lg px-4 font-display text-xs tracking-wider uppercase"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Unit
        </Button>
      </div>

      {/* Filter Tabs (shadcn Tabs) */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as CarFilterTab)}
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg border border-hairline bg-carbon px-3.5 py-2 font-mono text-[11px] font-medium text-brand-muted uppercase data-[state=active]:border-gold/50 data-[state=active]:bg-gold/15 data-[state=active]:font-bold data-[state=active]:text-gold"
            >
              {tab.label} ({counts[tab.value]})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Cars Grid */}
      {filteredCars.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-carbon p-10 text-center">
          <p className="font-display text-base font-bold text-white">
            Tidak ada unit dengan status{" "}
            {activeTab === "ALL" ? "apapun" : CAR_STATUS_LABELS[activeTab]}
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Pilih filter lain atau tambahkan unit kendaraan baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredCars.map((car) => (
            <AdminCarCard
              key={car.id}
              car={car}
              onEdit={openEdit}
              onStatusChange={changeCarStatus}
            />
          ))}
        </div>
      )}

      <CarFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCar={editingCar}
        onSave={saveCar}
      />
    </div>
  );
}

