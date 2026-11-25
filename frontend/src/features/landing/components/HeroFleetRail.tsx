import type { CarItem } from "@/features/cars/types/car.types";
import { formatRupiahCompact } from "@/lib/utils";

interface HeroFleetRailProps {
  cars: CarItem[];
  isLoading: boolean;
}

const SKELETON_COUNT = 3;

/**
 * Horizontal scroll-snap fleet pills on mobile hero.
 * Fixed height (`h-[52px]`) and skeleton prevent CLS while cars query resolves.
 */
export function HeroFleetRail({ cars, isLoading }: HeroFleetRailProps) {
  return (
    <div className="hero-mobile-rise-3 -mx-5 mt-5">
      <div
        aria-label="Ringkasan armada tersedia"
        className="carousel-track gap-2.5 px-5"
      >
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
              <div
                key={idx}
                aria-hidden="true"
                className="h-[52px] w-[144px] shrink-0 snap-start rounded-lg border border-hairline bg-carbon/70 px-3 py-2"
              >
                <div className="h-3 w-20 rounded bg-white/10" />
                <div className="mt-1.5 h-3 w-14 rounded bg-gold/20" />
              </div>
            ))
          : cars.map((car) => (
              <a
                key={car.id}
                href="#katalog"
                className="flex h-[52px] shrink-0 snap-start flex-col justify-center rounded-lg border border-white/12 bg-carbon/85 px-3.5 py-2 backdrop-blur-sm transition-transform active:scale-[0.98]"
              >
                <span className="max-w-[140px] truncate text-xs font-semibold text-white">
                  {car.name}
                </span>
                <span className="font-mono text-[11px] font-medium text-gold">
                  {formatRupiahCompact(car.pricePerDay)}
                  <span className="text-brand-muted">/hr</span>
                </span>
              </a>
            ))}
      </div>
    </div>
  );
}
