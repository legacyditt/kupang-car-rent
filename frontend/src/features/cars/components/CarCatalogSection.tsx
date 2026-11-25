import { useCallback, useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOTION_EASE, useDesktopGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { usePublicCars } from "../hooks/useAdminCars";
import { CarCard } from "./CarCard";

/** Katalog armada pada landing page: grid 2-4 kolom di desktop dan carousel di mobile. */
export function CarCatalogSection() {
  const { data: cars = [] } = usePublicCars();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liveStatus, setLiveStatus] = useState("");

  // Animasi masuk kartu katalog saat section terlihat di desktop (tanpa opacity: 0 agar tidak pernah tersembunyi saat jump ke #katalog).
  useDesktopGsap(
    sectionRef,
    (gsap) => {
      if (cars.length === 0) return;
      gsap.from("[data-catalog-card]", {
        y: 16,
        duration: 0.45,
        stagger: 0.06,
        ease: MOTION_EASE.ignition,
        force3D: true,
        clearProps: "transform",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 95%",
          once: true,
        },
      });
    },
    [cars.length]
  );

  // Geser carousel mobile ke indeks unit yang dipilih.
  const scrollToSlide = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const bounded = Math.max(0, Math.min(index, cars.length - 1));
    const slide = track.children[bounded] as HTMLElement | undefined;
    if (!slide) return;
    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft,
    });
    setActiveIndex(bounded);
    setLiveStatus(`Mobil ${bounded + 1} dari ${cars.length}`);
  }, [cars.length]);

  // Sinkronkan indikator slide aktif saat user menggeser carousel mobile.
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
    <section
      ref={sectionRef}
      id="katalog"
      className="border-t border-hairline bg-obsidian py-14 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
              Pilihan Mobil
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Harga Sewa Mobil Kupang.
            </h2>
            <p className="mt-2 text-sm text-brand-muted sm:text-base">
              Pilih mobil sesuai kebutuhan, cek jadwal ketersediaan, lalu pesan via WhatsApp.
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
              className="h-11 w-11 rounded-md border-hairline bg-carbon text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollToSlide(activeIndex + 1)}
              disabled={activeIndex === cars.length - 1}
              aria-label="Mobil berikutnya"
              className="h-11 w-11 rounded-md border-hairline bg-carbon text-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop & Tablet: 2-4 Column Grid */}
        <div className="mt-10 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
          {cars.map((car) => (
            <div key={car.id} data-catalog-card className="h-full">
              <CarCard car={car} />
            </div>
          ))}
        </div>

        {/* Mobile: Swipeable Horizontal Carousel with Depth-Focus Snap */}
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
            {cars.map((car, index) => {
              const isFocused = index === activeIndex;
              return (
                <div
                  key={car.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} dari ${cars.length}`}
                  className={cn(
                    "w-[80%] shrink-0 snap-start transition-[transform,opacity] duration-300 ease-out will-change-transform",
                    isFocused ? "scale-100 opacity-100" : "scale-[0.95] opacity-75"
                  )}
                >
                  <CarCard car={car} prioritizeImage={index === 0} />
                </div>
              );
            })}
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {liveStatus}
          </p>

          <nav
            aria-label="Pilih mobil"
            className="mt-5 flex items-center gap-2"
          >
            {cars.map((car, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => scrollToSlide(index)}
                  aria-label={`Lihat ${car.name}`}
                  aria-current={isActive ? "true" : undefined}
                  className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {isActive && (
                    <m.span
                      layoutId="catalog-mobile-active-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-gold"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}
