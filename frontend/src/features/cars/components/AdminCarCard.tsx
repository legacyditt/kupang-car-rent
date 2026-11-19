import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatRupiah } from "@/lib/utils";
import type { CarItem, CarStatus } from "../types/car.types";
import { CAR_STATUS_LABELS } from "../utils/car-admin";

interface AdminCarCardProps {
  car: CarItem;
  onEdit: (car: CarItem) => void;
  onStatusChange: (carId: string, status: CarStatus) => void;
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
}: AdminCarCardProps) {
  const isMaintenance = car.status === "MAINTENANCE";

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
                {car.brand} • {car.capacityLabel}
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

