import { useEffect, useState } from "react";
import * as m from "motion/react-m";
import { Button } from "@/components/ui/button";
import { BUSINESS_INFO } from "@/lib/constants";
import { TAP_SPRING } from "@/lib/motion";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function MobileStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const checkScroll = () => {
      rafId = 0;
      setVisible(window.scrollY > 220);
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(checkScroll);
      }
    };

    checkScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex h-[72px] items-center justify-between border-t border-gold/25 bg-carbon/95 px-4 backdrop-blur-md transition-transform duration-300 ease-out will-change-transform md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-medium tracking-wider text-brand-muted uppercase">
          Admin 24/7 Kupang
        </p>
        <p className="font-display text-sm font-bold tracking-tight text-white">
          {BUSINESS_INFO.whatsappDisplay}
        </p>
      </div>

      <m.div whileTap={TAP_SPRING}>
        <Button
          asChild
          variant="accent"
          className="sticky-shimmer relative h-11 overflow-hidden rounded-md px-5 text-xs tracking-wider uppercase"
        >
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat WA →
          </a>
        </Button>
      </m.div>
    </div>
  );
}
