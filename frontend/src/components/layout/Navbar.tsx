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
import { BUSINESS_INFO, NAV_LINKS } from "@/lib/constants";
import { MOTION_EASE, MOTION_MEDIA, registerMotionPlugins } from "@/lib/motion";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

registerMotionPlugins();

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
      setIsScrolled(scrollY > 24);

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
          whileTap={{ scale: 0.97 }}
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
            whileTap={{ scale: 0.97 }}
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
                Reservasi WA →
              </a>
            </Button>
          </m.div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-md border-hairline bg-carbon text-gold md:hidden"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-hairline bg-obsidian text-white">
              <SheetTitle className="flex items-center">
                <img
                  src={BUSINESS_INFO.logoPath}
                  alt={BUSINESS_INFO.name}
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              </SheetTitle>
              <nav
                aria-label="Navigasi Mobile"
                className="mt-6 flex flex-col gap-1"
              >
                {NAV_LINKS.map((link) => {
                  const isActive = link.href === activeHref;
                  return (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className={`flex min-h-[44px] items-center rounded-md px-3 font-mono text-xs tracking-wider uppercase transition-colors ${
                          isActive
                            ? "border-l-2 border-gold bg-carbon font-bold text-gold"
                            : "text-slate-300 hover:bg-carbon hover:text-white"
                        }`}
                      >
                        {link.code} {link.label}
                      </a>
                    </SheetClose>
                  );
                })}
              </nav>
              <div className="mt-auto pt-6">
                <Button
                  asChild
                  variant="accent"
                  className="h-12 w-full rounded-md font-display text-sm tracking-wider uppercase"
                >
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat WhatsApp ({BUSINESS_INFO.whatsappDisplay})
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
