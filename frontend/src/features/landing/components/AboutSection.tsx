import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import * as m from "motion/react-m";
import { Button } from "@/components/ui/button";
import { useBusinessProfile } from "@/features/business-profile/hooks/useBusinessProfile";
import {
  MOTION_EASE,
  MOTION_MEDIA,
  TAP_SPRING,
  registerMotionPlugins,
} from "@/lib/motion";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

registerMotionPlugins();

const BRAND_PILLARS = [
  {
    title: "Nyaman, Aman & Berkesan",
    description:
      "Bukan sekadar sampai tujuan, tapi pengalaman berkendara yang nyaman dan berkesan.",
  },
  {
    title: "Kendaraan Terawat & Profesional",
    description:
      "Unit prima dengan standar servis terjaga dan pelayanan yang ramah.",
  },
  {
    title: "Mudah & Dapat Diandalkan",
    description:
      "Bagian dari setiap perjalanan Anda—booking cepat dan transparan via WhatsApp.",
    highlight: true,
  },
] as const;

/** Section profil singkat dan keunggulan rental yang tersinkron dengan Profil Bisnis admin. */
export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { profile } = useBusinessProfile();

  // Animasi gambar dan daftar pilar keunggulan saat section terlihat di desktop.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_MEDIA.desktop, () => {
        gsap.from("[data-about-img]", {
          scale: 1.06,
          duration: 0.85,
          ease: MOTION_EASE.precision,
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        });

        gsap.from("[data-about-pillar]", {
          y: 16,
          opacity: 0,
          duration: 0.45,
          stagger: 0.09,
          ease: MOTION_EASE.ignition,
          force3D: true,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        });
      });

      mm.add(MOTION_MEDIA.mobile, () => {
        gsap.from("[data-about-pillar]", {
          y: 10,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: MOTION_EASE.precision,
          force3D: true,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            once: true,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="tentang"
      className="border-t border-hairline bg-obsidian py-14 lg:py-20"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-hairline bg-carbon">
          <img
            data-about-img
            src="/about.jpeg"
            alt="Unit Toyota Avanza Aventra Rental Kupang siap antar jemput"
            loading="lazy"
            width={960}
            height={720}
            className="aspect-[16/10] w-full object-cover object-center lg:aspect-[4/3]"
          />
        </div>

        <div>
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
            03 / Tentang {profile.name}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {profile.tagline}.
          </h2>

          <div className="mt-8 divide-y divide-hairline border-y border-hairline">
            {BRAND_PILLARS.map((pillar) => (
              <div key={pillar.title} data-about-pillar className="py-4">
                <h3
                  className={`font-display text-base font-bold sm:text-lg ${
                    "highlight" in pillar && pillar.highlight
                      ? "text-gold"
                      : "text-white"
                  }`}
                >
                  {pillar.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-brand-muted">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          <m.div whileHover={{ y: -1 }} whileTap={TAP_SPRING} className="mt-8">
            <Button
              asChild
              variant="accent"
              className="h-12 w-full rounded-md px-6 font-display text-xs tracking-wider uppercase sm:w-auto"
            >
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tanya Ketersediaan Unit →
              </a>
            </Button>
          </m.div>
        </div>
      </div>
    </section>
  );
}
