import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { usePublicCars } from "@/features/cars/hooks/useAdminCars";
import { formatRupiahCompact } from "@/lib/utils";
import { HeroFleetRail } from "./HeroFleetRail";

const FALLBACK_MIN_PRICE = 300_000;

/**
 * Mobile-only bottom-anchored action stack: large starting rate numeral,
 * full-width 52px CTA, and horizontal fleet chip rail.
 */
export function HeroMobilePanel() {
  const { data: cars = [], isLoading } = usePublicCars();

  const minPrice = useMemo(() => {
    if (cars.length === 0) return FALLBACK_MIN_PRICE;
    return Math.min(...cars.map((c) => c.pricePerDay));
  }, [cars]);

  return (
    <div className="mt-6 md:hidden">
      <div className="hero-mobile-rise-2 flex items-end justify-between gap-4 border-t border-white/12 pt-4">
        <div>
          <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-brand-muted uppercase">
            Mulai Dari
          </p>
          <p className="mt-0.5 font-display text-3xl font-bold tracking-tight text-white tabular-nums">
            {formatRupiahCompact(minPrice)}
            <span className="ml-1 font-mono text-xs font-normal text-brand-muted">
              /hari
            </span>
          </p>
        </div>
        <p className="pb-1 text-right font-mono text-[11px] text-slate-300">
          Lepas kunci · Sopir
        </p>
      </div>

      <div className="hero-mobile-rise-2 mt-4">
        <Button
          asChild
          variant="accent"
          className="h-[52px] w-full rounded-md font-display text-xs font-bold tracking-wider uppercase transition-transform active:scale-[0.98]"
        >
          <a href="#katalog">Cek Ketersediaan →</a>
        </Button>
      </div>

      <HeroFleetRail cars={cars} isLoading={isLoading} />
    </div>
  );
}
