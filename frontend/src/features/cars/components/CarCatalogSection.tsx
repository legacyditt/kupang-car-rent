import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INITIAL_CARS } from "../data/cars.mock";
import { CarCard } from "./CarCard";

export function CarCatalogSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liveStatus, setLiveStatus] = useState("");

  const scrollToSlide = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const bounded = Math.max(0, Math.min(index, INITIAL_CARS.length - 1));
    const slide = track.children[bounded] as HTMLElement | undefined;
    if (!slide) return;
    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft,
    });
    setActiveIndex(bounded);
    setLiveStatus(`Mobil ${bounded + 1} dari ${INITIAL_CARS.length}`);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const slides = Array.from(track.children) as HTMLElement[];
        let closestIndex = 0;
        let minDistance = Number.POSITIVE_INFINITY;

        slides.forEach((slide, idx) => {
          const distance = Math.abs(
            slide.offsetLeft - track.offsetLeft - track.scrollLeft,
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        });

        setActiveIndex(closestIndex);
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section id="katalog" className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-brand-blue uppercase">
              Katalog Mobil
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl lg:text-[34px]">
              Harga Sewa Mobil Kupang Harian
            </h2>
            <p className="mt-2 text-sm text-brand-muted sm:text-base">
              Pilih mobil rental di Kota Kupang sesuai kebutuhan Anda, cek harga dan ketersediaan.
            </p>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollToSlide(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Mobil sebelumnya"
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={() => scrollToSlide(activeIndex + 1)}
              disabled={activeIndex === INITIAL_CARS.length - 1}
              aria-label="Mobil berikutnya"
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop & Tablet: 1-4 Column Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INITIAL_CARS.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {/* Mobile: Accessible Horizontal Carousel */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Katalog Mobil"
          className="mt-8 md:hidden"
        >
          <div
            ref={trackRef}
            tabIndex={0}
            role="group"
            aria-label="Daftar Mobil"
            className="carousel-track gap-4 pb-2"
          >
            {INITIAL_CARS.map((car, index) => (
              <div
                key={car.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} dari ${INITIAL_CARS.length}`}
                className="w-[82%] shrink-0 snap-start"
              >
                <CarCard car={car} prioritizeImage={index === 0} />
              </div>
            ))}
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {liveStatus}
          </p>

          <nav
            aria-label="Pilih mobil"
            className="mt-5 flex items-center justify-center gap-2"
          >
            {INITIAL_CARS.map((car, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => scrollToSlide(index)}
                  aria-label={`Lihat ${car.name}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                    isActive
                      ? "w-6 bg-brand-navy"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400",
                  )}
                />
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}
