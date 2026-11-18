import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import * as m from "motion/react-m";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

gsap.registerPlugin(useGSAP);

export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const clickLockUntilRef = useRef(0);
  const [activeHref, setActiveHref] = useState<string>(NAV_LINKS[0].href);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleNavClick = (href: string) => {
    clickLockUntilRef.current = performance.now() + 700;
    setActiveHref(href);
  };

  useEffect(() => {
    let rafId = 0;

    const updateOnScroll = () => {
      rafId = 0;
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 40);

      if (performance.now() < clickLockUntilRef.current) return;

      if (scrollY < 40) {
        setActiveHref(NAV_LINKS[0].href);
        return;
      }

      const sections = NAV_LINKS.map((link) => ({
        href: link.href,
        el: document.getElementById(link.href.slice(1)),
      })).filter(
        (item): item is { href: (typeof NAV_LINKS)[number]["href"]; el: HTMLElement } =>
          item.el !== null
      );

      if (sections.length === 0) return;

      // If scrolled to the very bottom, activate the last section
      if (
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 24
      ) {
        setActiveHref(sections[sections.length - 1].href);
        return;
      }

      const offset = 140;
      let current: string = sections[0].href;
      for (const sec of sections) {
        if (sec.el.getBoundingClientRect().top <= offset) {
          current = sec.href;
        }
      }
      setActiveHref(current);
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateOnScroll);
      }
    };

    const onScrollEnd = () => {
      clickLockUntilRef.current = 0;
      updateOnScroll();
    };

    updateOnScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScrollEnd, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(headerRef.current, {
          y: -12,
          opacity: 0,
          duration: 0.45,
          ease: "power2.out",
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
      className="sticky top-0 z-40 w-full pointer-events-none"
    >
      <m.div
        layout
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className={`pointer-events-auto mx-auto flex items-center justify-between transition-colors duration-300 ${
          isScrolled
            ? "mt-3 h-14 max-w-5xl rounded-2xl border border-border/80 bg-white/85 px-4 shadow-lg shadow-brand-navy/10 backdrop-blur-md sm:px-6 lg:h-16"
            : "h-16 max-w-full rounded-none border-b border-border bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:h-20 lg:px-8"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <m.a
            href="#beranda"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <img
              src="/logo-v4.svg"
              alt="Logo Rental Mobil Kupang"
              width={128}
              height={42}
              className="h-8 w-auto object-contain lg:h-9"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-wide text-brand-navy sm:text-base">
                RENTAL MOBIL
              </span>
              <span className="text-[10px] font-semibold tracking-[0.15em] text-brand-blue sm:text-[11px]">
                KOTA KUPANG
              </span>
            </span>
          </m.a>

          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-2 md:flex"
          >
            {NAV_LINKS.map((link) => {
              const isActive = link.href === activeHref;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-brand-navy"
                      : "font-medium text-brand-muted hover:text-brand-navy"
                  }`}
                >
                  {isActive && (
                    <m.span
                      layoutId="navbar-active-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full bg-brand-light ring-1 ring-brand-blue/20"
                    />
                  )}
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <m.div
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="hidden md:block"
            >
              <Button asChild variant="accent" size={isScrolled ? "sm" : "default"}>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Booking Sekarang
                </a>
              </Button>
            </m.div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-brand-navy"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="flex items-center gap-2.5">
                <img
                  src="/logo-v4.svg"
                  alt="Logo Rental Mobil Kupang"
                  width={128}
                  height={42}
                  className="h-7 w-auto object-contain"
                />
                RENTAL MOBIL
              </SheetTitle>
              <nav
                aria-label="Navigasi Mobile"
                className="mt-4 flex flex-col gap-1"
              >
                                {NAV_LINKS.map((link) => {
                  const isActive = link.href === activeHref;
                  return (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className={
                          isActive
                            ? "rounded-lg bg-brand-light px-3 py-2.5 text-sm font-semibold text-brand-navy"
                            : "rounded-lg px-3 py-2.5 text-sm font-medium text-brand-text transition-colors hover:bg-brand-light hover:text-brand-navy"
                        }
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  );
                })}
              </nav>
              <div className="mt-auto pt-4">
                <Button asChild variant="accent" className="w-full" size="lg">
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Booking Sekarang
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </m.div>
    </header>
  );
}
