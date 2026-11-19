import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  CarFront,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { BUSINESS_INFO } from "@/lib/constants";
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

const SIDEBAR_STORAGE_KEY = "aventra-admin-sidebar-collapsed";

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage write failure in restricted contexts
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-hairline bg-carbon py-6 transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-[72px] items-center px-3" : "w-[248px] px-5"
      )}
    >
      <div
        className={cn(
          "flex w-full items-center",
          collapsed ? "flex-col gap-3" : "justify-between gap-2"
        )}
      >
        {collapsed ? (
          <Link
            to="/admin"
            title={BUSINESS_INFO.name}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-gold/30 bg-obsidian p-1"
          >
            <img
              src={BUSINESS_INFO.logoPath}
              alt={BUSINESS_INFO.name}
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </Link>
        ) : (
          <Link
            to="/admin"
            className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={BUSINESS_INFO.logoPath}
              alt={BUSINESS_INFO.name}
              width={132}
              height={40}
              className="h-9 w-auto object-contain"
            />
          </Link>
        )}

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-hairline bg-obsidian text-brand-muted transition-colors hover:border-gold/40 hover:text-gold"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav aria-label="Navigasi Admin" className="mt-7 w-full flex-1 space-y-1.5">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            item.to === "/admin"
              ? pathname === "/admin" || pathname === "/admin/"
              : pathname.startsWith(item.to);
          const Icon = item.icon;
          const badgeCount = "badgeCount" in item ? item.badgeCount : 0;

          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? `${item.code} ${item.label}` : undefined}
              className={cn(
                "relative flex h-[42px] items-center rounded-lg border font-mono text-xs tracking-wider uppercase transition-colors",
                collapsed ? "justify-center px-0" : "justify-between px-3",
                isActive
                  ? "border-gold/40 bg-gold/12 font-bold text-gold"
                  : "border-transparent font-medium text-brand-muted hover:border-hairline hover:bg-obsidian/60 hover:text-white"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!collapsed && (
                  <span className="truncate">
                    {item.code} {item.label}
                  </span>
                )}
              </span>

              {!collapsed && badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 font-mono text-[10px] font-bold text-obsidian">
                  {badgeCount}
                </span>
              )}

              {collapsed && badgeCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {collapsed ? (
        <Link
          to="/"
          title="Ke Website Guest"
          aria-label="Ke Website Guest"
          className="mt-auto flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-obsidian text-red-400 transition-colors hover:border-red-400/40 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <div className="mt-auto w-full rounded-xl border border-hairline bg-obsidian p-3">
          <p className="text-xs font-bold text-white">Admin Aventra</p>
          <Link
            to="/"
            className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-red-400 uppercase transition-colors hover:text-red-300"
          >
            <LogOut className="h-3 w-3" aria-hidden="true" />
            Ke Website Guest →
          </Link>
        </div>
      )}
    </aside>
  );
}
