import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import * as m from "motion/react-m";
import { Button } from "@/components/ui/button";
import {
  MOTION_EASE,
  MOTION_MEDIA,
  TAP_SPRING,
  registerMotionPlugins,
} from "@/lib/motion";

registerMotionPlugins();

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopImgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_MEDIA.desktop, () => {
        const section = sectionRef.current;
        const img = desktopImgRef.current;

        gsap.fromTo(
          img,
          { scale: 1.05 },
          {
            scale: 1,
            duration: 1.0,
            ease: MOTION_EASE.precision,
            force3D: true,
          }
        );

        gsap.from("[data-hero-beam]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.7,
          ease: MOTION_EASE.ignition,
          force3D: true,
          clearProps: "transform",
        });

        gsap.from("[data-hero-headline]", {
          clipPath: "inset(0 0 100% 0)",
          y: 16,
          duration: 0.75,
          ease: MOTION_EASE.ignition,
          force3D: true,
          clearProps: "clipPath,transform",
        });

        gsap.from("[data-hero-item]", {
          y: 16,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          delay: 0.12,
          ease: MOTION_EASE.ignition,
          force3D: true,
          clearProps: "transform,opacity",
        });

        gsap.to(img, {
          yPercent: 8,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 0.4,
          },
        });

        if (section && img) {
          const quickX = gsap.quickTo(img, "x", {
            duration: 0.6,
            ease: "power2.out",
          });
          const quickY = gsap.quickTo(img, "y", {
            duration: 0.6,
            ease: "power2.out",
          });

          const handlePointerMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const rect = section.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            quickX(nx * -16);
            quickY(ny * -10);
          };

          const handlePointerLeave = () => {
            quickX(0);
            quickY(0);
          };

          section.addEventListener("pointermove", handlePointerMove, {
            passive: true,
          });
          section.addEventListener("pointerleave", handlePointerLeave, {
            passive: true,
          });

          return () => {
            section.removeEventListener("pointermove", handlePointerMove);
            section.removeEventListener("pointerleave", handlePointerLeave);
          };
        }
      });

      mm.add(MOTION_MEDIA.mobile, () => {
        gsap.from("[data-hero-item]", {
          y: 10,
          opacity: 0,
          duration: 0.35,
          stagger: 0.05,
          ease: MOTION_EASE.precision,
          force3D: true,
          clearProps: "transform,opacity",
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="beranda"
      className="relative min-h-[78svh] overflow-hidden bg-obsidian text-white md:min-h-[680px] lg:min-h-[760px]"
    >
      {/* Mobile: Seamless editorial stage melting Hilux photo into obsidian */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] overflow-hidden md:hidden">
        <img
          src="/hero.jpeg"
          alt="Unit Toyota Hilux Aventra Rental di Kota Kupang"
          fetchPriority="high"
          width={1280}
          height={720}
          className="h-full w-full object-cover object-[58%_42%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-obsidian/15 via-obsidian/55 via-60% to-obsidian"
        />
      </div>

      {/* Desktop: Right-aligned 16:9 Hilux with left-to-right obsidian scrim */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[78%] overflow-hidden md:block">
        <img
          ref={desktopImgRef}
          src="/hero.jpeg"
          alt="Unit Toyota Hilux Aventra Rental di Kota Kupang"
          fetchPriority="high"
          width={1280}
          height={720}
          className="h-full w-full object-cover object-[65%_center] will-change-transform"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 via-35% to-obsidian/15"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent via-30% to-transparent"
        />
      </div>

      {/* Architectural 1px vertical rules (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto hidden max-w-7xl border-x border-white/[0.06] md:block md:absolute md:inset-0"
      />

      {/* Foreground Content */}
      <div className="relative mx-auto flex min-h-[78svh] max-w-7xl flex-col justify-end px-5 pb-10 pt-[36svh] sm:px-6 md:min-h-[680px] md:justify-center md:py-24 lg:min-h-[760px] lg:px-8">
        <div className="max-w-xl">
          <div
            data-hero-beam
            aria-hidden="true"
            className="mb-5 hidden h-[2px] w-16 bg-gradient-to-r from-gold to-gold/10 md:block"
          />

          <p
            data-hero-headline
            className="font-display text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[68px]"
          >
            DRIVEN IN{" "}
            <span className="block text-gold">GOLD STANDARD.</span>
          </p>

          <h1
            data-hero-item
            className="mt-4 max-w-md text-sm leading-relaxed font-normal text-slate-300 sm:text-base"
          >
            Sewa mobil harian di Kota Kupang. Avanza, Innova Reborn, Brio, dan Hilux—lepas kunci atau dengan sopir.
          </h1>

          {/* Compact Quick-Action Spec Strip */}
          <div
            data-hero-item
            className="mt-7 flex flex-col gap-3 rounded-lg border border-hairline bg-carbon/90 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:p-2.5"
          >
            <div className="grid grid-cols-2 divide-x divide-hairline sm:flex sm:items-center">
              <div className="pr-3 sm:px-3">
                <p className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
                  Tarif
                </p>
                <p className="text-xs font-semibold text-white sm:text-[13px]">
                  Mulai Rp 300rb/hari
                </p>
              </div>
              <div className="pl-3 sm:px-4">
                <p className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
                  Layanan
                </p>
                <p className="text-xs font-semibold text-white sm:text-[13px]">
                  Lepas Kunci / Sopir
                </p>
              </div>
            </div>

            <m.div whileHover={{ y: -1 }} whileTap={TAP_SPRING}>
              <Button
                asChild
                variant="accent"
                className="h-12 w-full rounded-md px-5 font-display text-xs tracking-wider uppercase sm:h-11 sm:w-auto"
              >
                <a href="#katalog">Cek Ketersediaan →</a>
              </Button>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}

