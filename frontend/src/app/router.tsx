import { createRoute, createRouter } from "@tanstack/react-router";
import { AdminLayout } from "@/features/admin-dashboard/components/AdminLayout";
import { rootRoute } from "@/routes/__root";
import { AdminOverviewPage } from "@/routes/admin/index";
import { AdminCarsPage } from "@/routes/admin/mobil";
import { AdminBookingsPage } from "@/routes/admin/booking";
import { AdminCalendarPage } from "@/routes/admin/kalender";
import { AdminSettingsPage } from "@/routes/admin/pengaturan";
import { AdminLoginPage } from "@/routes/admin/login";
import { guestLayoutRoute, indexRoute } from "@/routes/index";

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

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
  component: AdminCalendarPage,
});

const adminPengaturanRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/pengaturan",
  component: AdminSettingsPage,
});

const routeTree = rootRoute.addChildren([
  guestLayoutRoute.addChildren([indexRoute]),
  adminLoginRoute,
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
