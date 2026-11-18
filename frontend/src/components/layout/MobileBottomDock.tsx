import * as m from "motion/react-m";
import { CarFront, Home, KeyRound, ShieldCheck } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { TAP_SPRING } from "@/lib/motion";
import { useActiveSection } from "@/lib/useActiveSection";
import { cn } from "@/lib/utils";

const DOCK_ITEMS = [
  { href: "#beranda", label: "Beranda", icon: Home },
  { href: "#katalog", label: "Unit", icon: CarFront },
  { href: "#layanan", label: "Layanan", icon: KeyRound },
  { href: "#tentang", label: "Tentang", icon: ShieldCheck },
] as const;

export function MobileBottomDock() {
  const { activeHref, handleNavClick } = useActiveSection();

  return (
    <nav
      aria-label="Navigasi Mobile"
      className="fixed inset-x-4 bottom-3 z-40 mx-auto max-w-[380px] md:hidden"
    >
      <div className="grid grid-cols-4 items-center gap-1 rounded-full border border-gold/25 bg-carbon/92 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.65)] backdrop-blur-md">
        {DOCK_ITEMS.map((item, idx) => {
          const fallbackHref = NAV_LINKS[idx]?.href ?? item.href;
          const isActive = activeHref === fallbackHref;
          const Icon = item.icon;

          return (
            <m.a
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              whileTap={TAP_SPRING}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "text-obsidian" : "text-brand-muted hover:text-white"
              )}
            >
              {isActive && (
                <m.span
                  layoutId="mobile-dock-active-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-gold"
                />
              )}
              <Icon
                className="relative z-10 h-4 w-4"
                strokeWidth={isActive ? 2.2 : 1.75}
                aria-hidden="true"
              />
              <span className="relative z-10 font-mono text-[9px] uppercase">
                {item.label}
              </span>
            </m.a>
          );
        })}
      </div>
    </nav>
  );
}
