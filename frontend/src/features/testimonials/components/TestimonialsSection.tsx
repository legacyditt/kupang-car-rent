import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTestimonials } from "@/features/testimonials/hooks/useTestimonials";
import { cn } from "@/lib/utils";

const CARD_TILTS = [
  "md:-rotate-2 md:translate-y-2",
  "md:rotate-1 md:-translate-y-1",
  "md:-rotate-1 md:translate-y-1",
  "md:rotate-2 md:translate-y-2",
] as const;

/**
 * Section testimoni di bawah CTA WhatsApp: menampilkan ulasan terverifikasi (PUBLISHED)
 * dalam carousel kartu miring (tilted-arc) dengan tombol navigasi dan progress bar.
 */
export function TestimonialsSection() {
  const { publishedTestimonials } = useTestimonials();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const cards = Array.from(track.children) as HTMLElement[];
        let closest = 0;
        let minDist = Number.POSITIVE_INFINITY;
        cards.forEach((card, idx) => {
          const dist = Math.abs(
            card.offsetLeft - track.offsetLeft - track.scrollLeft
          );
          if (dist < minDist) {
            minDist = dist;
            closest = idx;
          }
        });
        setActiveIndex(closest);
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [publishedTestimonials.length]);

  if (publishedTestimonials.length === 0) return null;

  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const bounded = Math.max(
      0,
      Math.min(index, publishedTestimonials.length - 1)
    );
    const card = track.children[bounded] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
    setActiveIndex(bounded);
  };

  const progressPct =
    publishedTestimonials.length > 1
      ? ((activeIndex + 1) / publishedTestimonials.length) * 100
      : 100;

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

        {/* Tilted-Arc Horizontal Carousel */}
        <div
          ref={trackRef}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                        {Array.from({ length: item.rating }).map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className="h-3 w-3 fill-gold text-gold"
                            aria-hidden="true"
                          />
                        ))}
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

        {/* Navigation Controls & Progress Bar */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => scrollToCard(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Testimoni sebelumnya"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-hairline bg-carbon text-white transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => scrollToCard(activeIndex + 1)}
            disabled={activeIndex >= publishedTestimonials.length - 1}
            aria-label="Testimoni berikutnya"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-hairline bg-carbon text-white transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

