import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePublicTestimonials } from "@/features/testimonials/hooks/useTestimonials";
import { cn } from "@/lib/utils";

const CARD_TILTS = [
  "md:-rotate-2 md:translate-y-2",
  "md:rotate-1 md:-translate-y-1",
  "md:-rotate-1 md:translate-y-1",
  "md:rotate-2 md:translate-y-2",
] as const;

/**
 * Section testimoni di atas CTA WhatsApp: menampilkan ulasan terverifikasi (PUBLISHED)
 * dalam carousel kartu miring (tilted-arc) dengan arrow kiri/kanan kontekstual.
 */
export function TestimonialsSection() {
  const { data: publishedTestimonials = [] } = usePublicTestimonials();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollBounds = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollBounds();
    const handleScroll = () => updateScrollBounds();
    track.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollBounds);

    return () => {
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollBounds);
    };
  }, [publishedTestimonials.length, updateScrollBounds]);

  if (publishedTestimonials.length === 0) return null;

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * 380,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="testimoni"
      className="border-t border-hairline bg-obsidian py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Centered Editorial Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-gold uppercase">
            Testimoni Pelanggan
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Dipercaya Pelanggan di Kupang.
          </h2>
        </div>

        {/* Tilted-Arc Horizontal Carousel with Edge Arrows */}
        <div className="relative mt-12">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Geser testimoni ke kiri"
              className="absolute left-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gold/40 bg-carbon/90 text-gold shadow-xl backdrop-blur-sm transition-all hover:border-gold hover:bg-gold hover:text-obsidian sm:left-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Geser testimoni ke kanan"
              className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gold/40 bg-carbon/90 text-gold shadow-xl backdrop-blur-sm transition-all hover:border-gold hover:bg-gold hover:text-obsidian sm:right-2"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-6 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {publishedTestimonials.map((item, idx) => {
              const tiltClass = CARD_TILTS[idx % CARD_TILTS.length];
              const initial = item.customerName.trim().charAt(0).toUpperCase();

              return (
                <article
                  key={item.id}
                  className={cn(
                    "flex w-[84vw] max-w-[360px] shrink-0 snap-center flex-col justify-between rounded-2xl border border-gold/20 bg-carbon p-6 text-white shadow-[0_18px_48px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:rotate-0 hover:border-gold/45",
                    tiltClass
                  )}
                >
                  <div>
                    {/* Author Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-obsidian font-display text-lg font-bold text-gold">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-base font-bold text-white">
                          {item.customerName}
                        </h3>
                        <p className="truncate font-mono text-[11px] text-brand-muted">
                          {item.tripLabel}
                        </p>
                        <div className="mt-1 flex items-center gap-0.5">
                          {Array.from({ length: item.rating }).map(
                            (_, sIdx) => (
                              <Star
                                key={sIdx}
                                className="h-3 w-3 fill-gold text-gold"
                                aria-hidden="true"
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    <p className="mt-5 text-sm leading-relaxed text-slate-200">
                      <span className="font-display text-lg font-bold text-gold">
                        “
                      </span>
                      {item.quote}
                      <span className="font-display text-lg font-bold text-gold">
                        ”
                      </span>
                    </p>
                  </div>

                  <div className="mt-6 border-t border-hairline pt-3 font-mono text-[10px] tracking-wider text-brand-muted uppercase">
                    <span>Unit: {item.carName}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
