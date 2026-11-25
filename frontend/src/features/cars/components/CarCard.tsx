import { lazy, Suspense, useState } from "react";
import * as m from "motion/react-m";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TAP_SPRING } from "@/lib/motion";
import { formatRupiah } from "@/lib/utils";
import type { CarItem } from "../types/car.types";
import { CAR_TRANSMISSION_LABELS } from "../utils/car-admin";

const BookingModal = lazy(() =>
  import("./BookingModal").then((mod) => ({ default: mod.BookingModal }))
);

interface CarCardProps {
  car: CarItem;
  prioritizeImage?: boolean;
}

export function CarCard({ car, prioritizeImage = false }: CarCardProps) {
  const transmissionLabel =
    CAR_TRANSMISSION_LABELS[car.transmission ?? "BOTH"] ?? "Matic / Manual";
  const metadata = [
    car.capacityLabel !== "—" && car.capacityLabel !== "— Kursi"
      ? car.capacityLabel
      : null,
    transmissionLabel,
  ].filter(Boolean);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-hairline bg-carbon text-white transition-colors duration-200 hover:border-gold/50">
      <div className="card-sheen relative flex aspect-[16/10] w-full items-center justify-center bg-white p-3">
        <img
          src={car.imageUrl}
          alt={`Sewa ${car.name} Kupang`}
          loading={prioritizeImage ? undefined : "lazy"}
          width={320}
          height={200}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {car.status === "AVAILABLE" && (
          <Badge className="absolute right-3 top-3 border border-gold/40 bg-obsidian/90 font-mono text-[10px] tracking-wider text-gold uppercase">
            Tersedia
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        {metadata.length > 0 && (
          <p className="font-mono text-[10px] font-medium tracking-widest text-brand-muted uppercase">
            {metadata.join(" • ")}
          </p>
        )}

        <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-bold tracking-tight text-white">
          {car.name}
        </h3>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="font-mono text-lg font-bold text-gold">
            {formatRupiah(car.pricePerDay)}
          </span>
          <span className="font-mono text-[11px] text-brand-muted uppercase">
            / hari
          </span>
        </div>

        <m.div whileTap={TAP_SPRING} className="mt-auto pt-5">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-md border-gold/40 bg-obsidian font-mono text-xs tracking-wider text-gold uppercase hover:bg-gold hover:text-obsidian"
            onClick={() => setIsBookingOpen(true)}
          >
            + Detail &amp; Kalender{" "}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Button>
        </m.div>
      </CardContent>

      {isBookingOpen && (
        <Suspense fallback={null}>
          <BookingModal
            car={car}
            open={isBookingOpen}
            onOpenChange={setIsBookingOpen}
          />
        </Suspense>
      )}
    </Card>
  );
}
