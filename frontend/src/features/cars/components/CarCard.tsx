import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CarItem } from "../types/car.types";

interface CarCardProps {
  car: CarItem;
  prioritizeImage?: boolean;
}

export function CarCard({ car, prioritizeImage = false }: CarCardProps) {
  const detailMessage = `Halo, saya tertarik menyewa ${car.name} (${car.category}). Mohon info ketersediaannya.`;
  const metadata = [
    car.capacityLabel !== "—" ? `Kapasitas: ${car.capacityLabel}` : null,
    car.transmissionLabel !== "—" ? `Transmisi: ${car.transmissionLabel}` : null,
  ].filter(Boolean);

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-[14px] border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative flex aspect-[16/10] w-full items-center justify-center bg-white p-3">
        <img
          src={car.imageUrl}
          alt={`${car.name} - ${car.category}`}
          loading={prioritizeImage ? undefined : "lazy"}
          width={320}
          height={200}
          className="h-full w-full object-contain"
        />
        {car.status === "AVAILABLE" && (
          <Badge variant="available" className="absolute right-3 top-3">
            Tersedia
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-5 pt-2">
        <span className="text-xs font-semibold text-brand-blue">
          {car.category}
        </span>
        <h3 className="mt-1 line-clamp-2 text-lg font-bold text-brand-text">
          {car.name}
        </h3>

        {metadata.length > 0 && (
          <p className="mt-1.5 min-h-[1.25rem] text-xs text-brand-muted">
            {metadata.join(" • ")}
          </p>
        )}

        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-brand-navy">
            {formatRupiah(car.pricePerDay)}
          </span>
          <span className="text-xs text-brand-muted">/ hari</span>
        </div>

        <div className="mt-auto pt-4">
          <Button asChild className="w-full">
            <a
              href={buildWhatsAppUrl(detailMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Booking
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
