import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as m from "motion/react-m";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUSINESS_INFO } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Keep LCP image at opacity: 1 from frame 0; only settle scale smoothly.
        gsap.fromTo(
          bgRef.current,
          { scale: 1.08 },
          {
            scale: 1.02,
            duration: 1.1,
            ease: "power2.out",
            force3D: true,
          }
        );

        gsap.from("[data-hero-item]", {
          y: 22,
          opacity: 0,
          duration: 0.6,
          stagger: 0.09,
          ease: "power3.out",
          force3D: true,
          clearProps: "transform,opacity",
        });

        // Scroll-Morph: full-bleed hero morphs into rounded floating frame on scroll
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });

        scrollTl
          .to(
            sectionRef.current,
            {
              scale: 0.94,
              borderRadius: "28px",
              transformOrigin: "center bottom",
              ease: "none",
              force3D: true,
            },
            0
          )
          .to(
            bgRef.current,
            {
              yPercent: 12,
              ease: "none",
              force3D: true,
            },
            0
          )
          .to(
            contentRef.current,
            {
              y: -24,
              opacity: 0.35,
              ease: "none",
              force3D: true,
            },
            0
          );
      });
    },
    { scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} className="bg-background">
      <section
        ref={sectionRef}
        id="beranda"
        className="relative overflow-hidden bg-brand-deep text-white will-change-transform"
      >
        <img
          ref={bgRef}
          src="/hero.jpeg"
          alt="Unit Toyota Hilux rental mobil di Kota Kupang, Nusa Tenggara Timur"
          fetchPriority="high"
          width={1280}
          height={720}
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center will-change-transform"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#061B3AF2] via-[#092B59CC] to-[#092B5966] md:bg-gradient-to-r md:from-[#061B3AF2] md:via-[#092B59D9] md:to-transparent"
        />

        <div
          ref={contentRef}
          className="relative mx-auto flex min-h-[500px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:min-h-[600px] lg:px-8 lg:py-24"
        >
          <div className="max-w-xl">
            <div data-hero-item>
              <Badge className="mb-5 gap-1.5 border border-brand-sky/40 bg-brand-navy/80 px-3.5 py-1.5 text-xs font-semibold text-brand-yellow">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {BUSINESS_INFO.location}
              </Badge>
            </div>

            <h1
              data-hero-item
              className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[52px] lg:leading-[1.15]"
            >
              Rental Mobil Kupang Murah, Lepas Kunci &amp; Dengan Sopir
            </h1>

            <p
              data-hero-item
              className="mt-4 max-w-lg text-base leading-relaxed text-slate-200 sm:text-lg"
            >
              Sewa mobil Kupang harian: Avanza, Innova Reborn, Brio, dan Hilux. Mobil bersih dan terawat untuk wisata,
              bisnis, dan keluarga.
            </p>

            <div
              data-hero-item
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <m.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
              >
                <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Booking Sekarang
                  </a>
                </Button>
              </m.div>

              <m.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
              >
                <Button asChild variant="outlineLight" size="lg" className="w-full sm:w-auto">
                  <a href="#katalog">Lihat Katalog</a>
                </Button>
              </m.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

