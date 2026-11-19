import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  CarFront,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_NAV_ITEMS = [
  { to: "/admin", code: "01", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/mobil", code: "02", label: "Kendaraan", icon: CarFront },
  {
    to: "/admin/booking",
    code: "03",
    label: "Booking",
    icon: ClipboardList,
    badgeCount: 3,
  },
  { to: "/admin/kalender", code: "04", label: "Kalender", icon: CalendarDays },
  { to: "/admin/pengaturan", code: "05", label: "Pengaturan", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-hairline bg-carbon px-5 py-7 md:flex">
      <div>
        <Link
          to="/"
          className="block font-display text-lg font-bold tracking-wider text-white uppercase"
        >
          Aventra Rental
        </Link>
        <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-gold uppercase">
          Admin Console • Kupang
        </p>
      </div>

      <nav aria-label="Navigasi Admin" className="mt-7 flex-1 space-y-1.5">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            item.to === "/admin"
              ? pathname === "/admin" || pathname === "/admin/"
              : pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-[42px] items-center justify-between rounded-lg border px-3 font-mono text-xs tracking-wider uppercase transition-colors",
                isActive
                  ? "border-gold/40 bg-gold/12 font-bold text-gold"
                  : "border-transparent font-medium text-brand-muted hover:border-hairline hover:bg-obsidian/60 hover:text-white"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>
                  {item.code} {item.label}
                </span>
              </span>
              {"badgeCount" in item && item.badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 font-mono text-[10px] font-bold text-obsidian">
                  {item.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-hairline bg-obsidian p-3">
        <p className="text-xs font-bold text-white">Admin Aventra</p>
        <Link
          to="/"
          className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-red-400 uppercase transition-colors hover:text-red-300"
        >
          <LogOut className="h-3 w-3" aria-hidden="true" />
          Ke Website Guest →
        </Link>
      </div>
    </aside>
  );
}
