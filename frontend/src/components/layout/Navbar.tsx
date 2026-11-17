import { useEffect, useState } from "react";
import { Car, Menu } from "lucide-react";
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

export function Navbar() {
  const [activeHref, setActiveHref] = useState<string>(NAV_LINKS[0].href);
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1)),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <a
          href="#beranda"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-navy text-brand-yellow">
            <Car className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide text-brand-navy sm:text-base">
              RENTAL MOBIL
            </span>
            <span className="text-[10px] font-semibold tracking-[0.15em] text-brand-blue sm:text-[11px]">
              KOTA KUPANG
            </span>
          </span>
        </a>

        <nav
          aria-label="Navigasi Utama"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.href === activeHref;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveHref(link.href)}
                className={
                  isActive
                    ? "relative py-1 text-sm font-semibold text-brand-navy after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-7 after:rounded-full after:bg-brand-yellow"
                    : "py-1 text-sm font-medium text-brand-muted transition-colors hover:text-brand-navy"
                }
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="accent" className="hidden md:inline-flex">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Booking Sekarang
            </a>
          </Button>

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
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-brand-yellow">
                  <Car className="h-4 w-4" aria-hidden="true" />
                </span>
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
                        onClick={() => setActiveHref(link.href)}
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
    </header>
  );
}
