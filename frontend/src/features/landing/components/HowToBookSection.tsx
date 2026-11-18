import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MOTION_EASE, MOTION_MEDIA, registerMotionPlugins } from "@/lib/motion";

registerMotionPlugins();

const BOOKING_STEPS = [
  {
    step: "01",
    title: "Pilih Mobil",
    description: "Tentukan unit sesuai kebutuhan perjalanan Anda.",
  },
  {
    step: "02",
    title: "Tentukan Jadwal",
    description: "Pilih tanggal mulai & selesai pada kalender ketersediaan.",
  },
  {
    step: "03",
    title: "Isi Data Singkat",
    description: "Masukkan nama dan nomor WhatsApp aktif Anda.",
  },
  {
    step: "04",
    title: "Konfirmasi Instan",
    description: "Admin kami mengonfirmasi jadwal & lokasi serah terima.",
    isFinal: true,
  },
] as const;

export function HowToBookSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_MEDIA.desktop, () => {
        gsap.from("[data-route-line]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.75,
          ease: MOTION_EASE.ignition,
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        });

        gsap.from("[data-step-item]", {
          y: 16,
          opacity: 0,
          duration: 0.45,
          stagger: 0.09,
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
        gsap.from("[data-step-spine]", {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 0.55,
          ease: MOTION_EASE.precision,
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        });

        gsap.from("[data-step-item]", {
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
      className="border-t border-hairline bg-obsidian py-14 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
          Alur Reservasi
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Booking Cepat dalam 4 Langkah.
        </h2>

        <div className="relative mt-10">
          <div
            data-route-line
            aria-hidden="true"
            className="hidden h-[2px] w-full bg-gradient-to-r from-gold/80 via-gold/40 to-gold md:block"
          />
          <div
            data-step-spine
            aria-hidden="true"
            className="absolute bottom-2 left-0 top-2 w-[2px] bg-gradient-to-b from-gold/80 via-gold/40 to-gold md:hidden"
          />

          <div className="grid grid-cols-1 divide-y divide-hairline border-b border-hairline pl-4 md:grid-cols-4 md:divide-x md:divide-y-0 md:border-b md:pl-0">
            {BOOKING_STEPS.map((item) => (
              <div
                key={item.step}
                data-step-item
                className="py-5 md:px-6 md:py-6 md:first:pl-0 md:last:pr-0"
              >
                <span
                  className={`font-mono text-xs font-bold tracking-widest ${
                    "isFinal" in item && item.isFinal
                      ? "text-gold"
                      : "text-brand-muted"
                  }`}
                >
                  STEP {item.step}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
