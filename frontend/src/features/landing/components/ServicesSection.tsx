import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, KeyRound, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { registerMotionPlugins } from "@/lib/motion-plugins";
import { MOTION_EASE, MOTION_MEDIA } from "@/lib/motion";

registerMotionPlugins();

const SERVICES = [
  {
    code: "01",
    title: "Dengan Sopir",
    description:
      "Nikmati perjalanan nyaman tanpa menyetir sendiri. Cocok untuk dinas, wisata Timor, dan keluarga.",
    note: "Rekomendasi wisata & dinas",
    icon: UserCheck,
  },
  {
    code: "02",
    title: "Lepas Kunci (Self-Drive)",
    description:
      "Kebebasan penuh mengatur rute dan jadwal perjalanan Anda sendiri dengan unit pilihan.",
    note: "Fleksibel & privasi penuh",
    icon: KeyRound,
  },
] as const;

/** Section layanan sewa yang menjelaskan opsi Dengan Sopir dan Lepas Kunci. */
export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Animasi garis dan kartu layanan saat section masuk viewport desktop.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_MEDIA.desktop, () => {
        gsap.from("[data-service-line]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.65,
          ease: MOTION_EASE.ignition,
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            once: true,
          },
        });

        gsap.from("[data-service-card]", {
          y: 22,
          opacity: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: MOTION_EASE.ignition,
          force3D: true,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        });
      });

      mm.add(MOTION_MEDIA.mobile, () => {
        gsap.from("[data-service-card]", {
          y: 12,
          opacity: 0,
          duration: 0.32,
          stagger: 0.06,
          ease: MOTION_EASE.precision,
          force3D: true,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
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
      id="layanan"
      className="border-t border-hairline bg-carbon py-14 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
          Opsi Layanan
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Lepas Kunci &amp; Dengan Sopir.
        </h2>
        <div
          data-service-line
          aria-hidden="true"
          className="mt-4 hidden h-[1px] w-24 bg-gradient-to-r from-gold/80 to-transparent md:block"
        />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.title}
                data-service-card
                className="group rounded-xl border-hairline bg-obsidian py-0 text-white transition-all duration-200 hover:border-gold/45 active:scale-[0.985] md:active:scale-100"
              >
                <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-white">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      {service.description}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-gold">
                      {service.note}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
