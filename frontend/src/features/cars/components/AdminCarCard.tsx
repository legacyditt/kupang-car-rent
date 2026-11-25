import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmitLock } from "@/hooks/useSubmitLock";
import { cn, formatRupiah } from "@/lib/utils";
import type { CarItem, CarStatus, CarUnitItem } from "../types/car.types";
import {
  CAR_STATUS_LABELS,
  CAR_TRANSMISSION_LABELS,
} from "../utils/car-admin";

interface AdminCarCardProps {
  car: CarItem;
  onEdit: (car: CarItem) => void;
  onStatusChange: (carId: string, status: CarStatus) => void;
  onAddUnit?: (
    carId: string,
    input: {
      label: string;
      plateNumber: string;
      transmission: "MATIC" | "MANUAL";
    }
  ) => Promise<void>;
  onUpdateUnitStatus?: (unitId: string, status: CarStatus) => Promise<void>;
  onDeleteUnit?: (unitId: string) => Promise<void>;
}

const STATUS_BADGE_MAP: Record<CarStatus, string> = {
  AVAILABLE: "border-emerald-400/40 bg-emerald-400/15 text-emerald-400",
  RENTED: "border-sky-400/40 bg-sky-400/15 text-sky-400",
  MAINTENANCE: "border-red-400/40 bg-red-400/15 text-red-400",
  INACTIVE: "border-hairline bg-obsidian text-brand-muted",
};

const CAR_STATUSES: CarStatus[] = [
  "AVAILABLE",
  "RENTED",
  "MAINTENANCE",
  "INACTIVE",
];

export function AdminCarCard({
  car,
  onEdit,
  onStatusChange,
  onAddUnit,
  onUpdateUnitStatus,
  onDeleteUnit,
}: AdminCarCardProps) {
  const isMaintenance = car.status === "MAINTENANCE";
  const units: CarUnitItem[] = car.units ?? [];
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [unitLabel, setUnitLabel] = useState(`${car.name} #${units.length + 1}`);
  const [plateNumber, setPlateNumber] = useState("");
  const [unitTrans, setUnitTrans] = useState<"MATIC" | "MANUAL">(
    car.transmission === "MATIC" ? "MATIC" : "MANUAL"
  );
  const [unitError, setUnitError] = useState<string | null>(null);
  const { isSubmitting: isAddingUnit, runWithLock: runAddUnitLock } =
    useSubmitLock();

  async function handleAddUnitSubmit(e: FormEvent) {
    e.preventDefault();
    if (!onAddUnit) return;
    setUnitError(null);
    await runAddUnitLock(async () => {
      try {
        await onAddUnit(car.id, {
          label: unitLabel.trim() || `${car.name} #${units.length + 1}`,
          plateNumber: plateNumber.trim().toUpperCase(),
          transmission: unitTrans,
        });
        setPlateNumber("");
        setShowAddUnit(false);
      } catch (err) {
        setUnitError(
          err instanceof Error ? err.message : "Gagal menambah unit fisik."
        );
      }
    });
  }

  return (
    <Card
      className={cn(
        "rounded-2xl bg-carbon text-white transition-colors",
        isMaintenance ? "border-red-400/35" : "border-hairline hover:border-gold/40"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-white p-1.5">
              <img
                src={car.imageUrl}
                alt={car.name}
                width={96}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] tracking-widest text-brand-muted uppercase">
                {CAR_TRANSMISSION_LABELS[car.transmission ?? "BOTH"] ??
                  "Matic / Manual"}{" "}
                • {car.capacityLabel} • {units.length} Unit
              </p>
              <h3 className="mt-1 truncate font-display text-lg font-bold text-white">
                {car.name}
              </h3>
              <p className="mt-1 font-mono text-sm font-bold text-gold tabular-nums">
                {formatRupiah(car.pricePerDay)}{" "}
                <span className="text-[11px] font-normal text-brand-muted">
                  / hari
                </span>
              </p>
            </div>
          </div>

          <Badge
            className={cn(
              "shrink-0 rounded-md border font-mono text-[10px] font-bold uppercase",
              STATUS_BADGE_MAP[car.status]
            )}
          >
            {CAR_STATUS_LABELS[car.status]}
          </Badge>
        </div>

        {/* Physical Units & Plate Numbers (Admin-Only) */}
        <div className="mt-4 space-y-2 border-t border-hairline pt-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-wider text-brand-muted uppercase">
              Unit Fisik &amp; Plat Nomor
            </span>
            {onAddUnit && (
              <button
                type="button"
                onClick={() => {
                  setUnitLabel(`${car.name} #${units.length + 1}`);
                  setUnitError(null);
                  setShowAddUnit((prev) => !prev);
                }}
                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-gold hover:text-gold-light"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                Tambah Unit
              </button>
            )}
          </div>

          {units.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-obsidian px-2.5 py-1.5 text-xs"
            >
              <div className="min-w-0">
                <span className="font-mono text-[11px] font-bold text-white">
                  {u.plateNumber}
                </span>
                <span className="ml-2 font-mono text-[10px] text-brand-muted">
                  {u.label} • {u.transmission === "MATIC" ? "Matic" : "Manual"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {onUpdateUnitStatus && (
                  <select
                    aria-label={`Status ${u.plateNumber}`}
                    value={u.status}
                    onChange={(e) =>
                      onUpdateUnitStatus(u.id, e.target.value as CarStatus)
                    }
                    className="h-6 rounded border border-hairline bg-carbon px-1.5 font-mono text-[10px] text-gold focus:border-gold focus:outline-none"
                  >
                    {CAR_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {CAR_STATUS_LABELS[st]}
                      </option>
                    ))}
                  </select>
                )}
                {onDeleteUnit && units.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Hapus ${u.plateNumber}`}
                    onClick={async () => {
                      setUnitError(null);
                      try {
                        await onDeleteUnit(u.id);
                      } catch (err) {
                        setUnitError(
                          err instanceof Error
                            ? err.message
                            : "Unit tidak dapat dihapus."
                        );
                      }
                    }}
                    className="rounded p-1 text-brand-muted hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {showAddUnit && (
            <form
              onSubmit={handleAddUnitSubmit}
              className="grid grid-cols-1 gap-2 rounded-lg border border-gold/30 bg-obsidian p-2.5 sm:grid-cols-4"
            >
              <Input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="DH 1234 AB"
                required
                className="h-8 border-hairline bg-carbon font-mono text-xs text-white uppercase"
              />
              <Input
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                placeholder="Label unit"
                required
                className="h-8 border-hairline bg-carbon text-xs text-white"
              />
              <select
                value={unitTrans}
                onChange={(e) =>
                  setUnitTrans(e.target.value as "MATIC" | "MANUAL")
                }
                className="h-8 rounded border border-hairline bg-carbon px-2 font-mono text-xs text-white"
              >
                <option value="MATIC">Matic</option>
                <option value="MANUAL">Manual</option>
              </select>
              <Button
                type="submit"
                size="sm"
                disabled={isAddingUnit}
                className="h-8 bg-gold font-mono text-[10px] font-bold text-obsidian uppercase hover:bg-gold-light"
              >
                {isAddingUnit ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          )}

          {unitError && (
            <p className="font-mono text-[10px] text-red-400">{unitError}</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-hairline pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onEdit(car)}
            className="h-9 flex-1 border-hairline bg-obsidian font-mono text-[11px] font-bold tracking-wider text-white uppercase hover:border-gold/50 hover:text-gold"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit Unit &amp; Harga
          </Button>

          <Select
            value={car.status}
            onValueChange={(val) => onStatusChange(car.id, val as CarStatus)}
          >
            <SelectTrigger
              aria-label={`Ubah status ${car.name}`}
              className="h-9 w-[155px] border-gold/30 bg-obsidian font-mono text-[11px] font-bold text-gold uppercase"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-hairline bg-carbon text-white">
              {CAR_STATUSES.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="font-mono text-xs focus:bg-obsidian focus:text-gold"
                >
                  {CAR_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
