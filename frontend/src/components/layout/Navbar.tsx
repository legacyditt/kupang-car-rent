import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import * as m from "motion/react-m";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_INFO, NAV_LINKS } from "@/lib/constants";
import {
  MOTION_EASE,
  MOTION_MEDIA,
  TAP_SPRING,
  registerMotionPlugins,
} from "@/lib/motion";
import { useActiveSection } from "@/lib/useActiveSection";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

registerMotionPlugins();

export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const { activeHref, isScrolled, handleNavClick } = useActiveSection();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_MEDIA.any, () => {
        gsap.from(headerRef.current, {
          y: -10,
          opacity: 0,
          duration: 0.4,
          ease: MOTION_EASE.precision,
          force3D: true,
          clearProps: "transform,opacity",
        });
      });
    },
    { scope: headerRef }
  );

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
        isScrolled
          ? "border-gold/30 bg-obsidian/92 backdrop-blur-md"
          : "border-white/10 bg-obsidian/75 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <m.a
          href="#beranda"
          onClick={() => handleNavClick("#beranda")}
          whileTap={TAP_SPRING}
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src={BUSINESS_INFO.logoPath}
            alt={BUSINESS_INFO.name}
            width={148}
            height={44}
            className="h-9 w-auto object-contain lg:h-11"
          />
        </m.a>

        <nav
          aria-label="Navigasi Utama"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.href === activeHref;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`relative py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                  isActive
                    ? "font-bold text-gold"
                    : "font-medium text-brand-muted hover:text-white"
                }`}
              >
                {link.code} {link.label}
                {isActive && (
                  <m.span
                    layoutId="navbar-active-line"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-gold"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <m.div
            whileHover={{ y: -1 }}
            whileTap={TAP_SPRING}
            className="hidden md:block"
          >
            <Button
              asChild
              variant="accent"
              className="h-10 rounded-md px-5 font-display text-xs tracking-wider uppercase"
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

          <m.div whileTap={TAP_SPRING} className="md:hidden">
            <Button
              asChild
              variant="accent"
              className="sticky-shimmer relative h-9 overflow-hidden rounded-full px-4 font-display text-[11px] tracking-wider uppercase"
            >
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Chat WA
              </a>
            </Button>
          </m.div>
        </div>
      </div>
    </header>
  );
}
