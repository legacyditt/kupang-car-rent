import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import * as m from "motion/react-m";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_INFO } from "@/lib/constants";
import {
  MOTION_EASE,
  MOTION_MEDIA,
  TAP_SPRING,
  registerMotionPlugins,
} from "@/lib/motion";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

registerMotionPlugins();

export function WhatsAppCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_MEDIA.any, () => {
        gsap.from("[data-wa-banner]", {
          y: 18,
          opacity: 0,
          duration: 0.5,
          ease: MOTION_EASE.ignition,
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
      className="border-t border-hairline bg-obsidian py-14 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div
          data-wa-banner
          className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 via-carbon to-carbon px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-12"
        >
          <div className="relative max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Siap Berangkat Hari Ini di Kupang?
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-300 sm:text-base">
              Konsultasikan rute, ketersediaan unit, atau tarif khusus sewa mingguan &amp; bulanan langsung dengan admin kami.
            </p>
          </div>

          <m.div
            whileHover={{ y: -1 }}
            whileTap={TAP_SPRING}
            className="beacon-ring relative mt-6 shrink-0 rounded-md lg:mt-0"
          >
            <Button
              asChild
              variant="accent"
              size="lg"
              className="h-12 w-full rounded-md font-display text-xs tracking-wider uppercase sm:w-auto"
            >
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat WA: {BUSINESS_INFO.whatsappDisplay}
              </a>
            </Button>
          </m.div>
        </div>
      </div>
    </section>
  );
}
