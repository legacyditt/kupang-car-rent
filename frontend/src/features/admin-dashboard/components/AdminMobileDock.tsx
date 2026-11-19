import { Link, useRouterState } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { CalendarDays, CarFront, ClipboardList, LayoutDashboard } from "lucide-react";
import { TAP_SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MOBILE_ADMIN_ITEMS = [
  { to: "/admin", label: "Home", icon: LayoutDashboard },
  { to: "/admin/mobil", label: "Unit", icon: CarFront },
  { to: "/admin/booking", label: "Book (3)", icon: ClipboardList },
  { to: "/admin/kalender", label: "Jadwal", icon: CalendarDays },
] as const;

export function AdminMobileDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navigasi Admin Mobile"
      className="fixed inset-x-4 bottom-3 z-40 mx-auto max-w-[380px] md:hidden"
    >
      <div className="grid grid-cols-4 items-center gap-1 rounded-full border border-gold/25 bg-carbon/92 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.65)] backdrop-blur-md">
        {MOBILE_ADMIN_ITEMS.map((item) => {
          const isActive =
            item.to === "/admin"
              ? pathname === "/admin" || pathname === "/admin/"
              : pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <m.div key={item.to} whileTap={TAP_SPRING}>
              <Link
                to={item.to}
                className={cn(
                  "relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] font-medium tracking-wide transition-colors",
                  isActive ? "text-obsidian" : "text-brand-muted hover:text-white"
                )}
              >
                {isActive && (
                  <m.span
                    layoutId="admin-mobile-dock-pill"
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
              </Link>
            </m.div>
          );
        })}
      </div>
    </nav>
  );
}

