import {
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { rootRoute } from "@/routes/__root";
import { guestLayoutRoute, indexRoute } from "@/routes/index";

/**
 * Code-split secondary and admin routes so landing-page visitors do not
 * download heavy admin/export bundles (jspdf, html2canvas, xlsx) on initial load.
 */
const ulasanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ulasan",
  component: lazyRouteComponent(
    () => import("@/routes/ulasan"),
    "CustomerReviewPage"
  ),
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: lazyRouteComponent(
    () => import("@/routes/admin/login"),
    "AdminLoginPage"
  ),
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: lazyRouteComponent(
    () => import("@/features/admin-dashboard/components/AdminLayout"),
    "AdminLayout"
  ),
});

const adminOverviewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("@/routes/admin/index"),
    "AdminOverviewPage"
  ),
});

const adminMobilRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/mobil",
  component: lazyRouteComponent(
    () => import("@/routes/admin/mobil"),
    "AdminCarsPage"
  ),
});

const adminBookingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/booking",
  component: lazyRouteComponent(
    () => import("@/routes/admin/booking"),
    "AdminBookingsPage"
  ),
});

const adminKalenderRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/kalender",
  component: lazyRouteComponent(
    () => import("@/routes/admin/kalender"),
    "AdminCalendarPage"
  ),
});

const adminKeuanganRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/keuangan",
  component: lazyRouteComponent(
    () => import("@/routes/admin/keuangan"),
    "AdminFinancePage"
  ),
});

const adminTestimoniRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/testimoni",
  component: lazyRouteComponent(
    () => import("@/routes/admin/testimoni"),
    "AdminTestimonialsPage"
  ),
});

const adminPengaturanRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/pengaturan",
  component: lazyRouteComponent(
    () => import("@/routes/admin/pengaturan"),
    "AdminSettingsPage"
  ),
});

const routeTree = rootRoute.addChildren([
  guestLayoutRoute.addChildren([indexRoute]),
  ulasanRoute,
  adminLoginRoute,
  adminLayoutRoute.addChildren([
    adminOverviewRoute,
    adminMobilRoute,
    adminBookingRoute,
    adminKalenderRoute,
    adminKeuanganRoute,
    adminTestimoniRoute,
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
