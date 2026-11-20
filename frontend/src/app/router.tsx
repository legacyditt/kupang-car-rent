import { createRoute, createRouter } from "@tanstack/react-router";
import { AdminLayout } from "@/features/admin-dashboard/components/AdminLayout";
import { rootRoute } from "@/routes/__root";
import { AdminOverviewPage } from "@/routes/admin/index";
import { AdminCarsPage } from "@/routes/admin/mobil";
import { AdminBookingsPage } from "@/routes/admin/booking";
import { guestLayoutRoute, indexRoute } from "@/routes/index";

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminOverviewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminOverviewPage,
});

function createAdminPlaceholder(code: string, title: string) {
  return function AdminSectionPlaceholder() {
    return (
      <div className="rounded-2xl border border-hairline bg-carbon p-6">
        <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
          {code} / {title}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          Kerangka route siap. Implementasi penuh menyusul pada tahap berikutnya.
        </p>
      </div>
    );
  };
}

const adminMobilRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/mobil",
  component: AdminCarsPage,
});

const adminBookingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/booking",
  component: AdminBookingsPage,
});

const adminKalenderRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/kalender",
  component: createAdminPlaceholder("04", "Kalender Penyewaan"),
});

const adminPengaturanRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/pengaturan",
  component: createAdminPlaceholder("05", "Pengaturan Bisnis"),
});

const routeTree = rootRoute.addChildren([
  guestLayoutRoute.addChildren([indexRoute]),
  adminLayoutRoute.addChildren([
    adminOverviewRoute,
    adminMobilRoute,
    adminBookingRoute,
    adminKalenderRoute,
    adminPengaturanRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
