import { Navigate, Outlet } from "@tanstack/react-router";
import { useAdminAuth } from "@/features/admin-auth/hooks/useAdminAuth";
import { useDocumentMeta } from "@/lib/seo";
import { AdminMobileDock } from "./AdminMobileDock";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  useDocumentMeta({
    title: "Dashboard Admin — Aventra Rental",
    robots: "noindex, nofollow",
  });
  const { isAuthenticated, isPending } = useAdminAuth();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian font-mono text-xs text-brand-muted">
        Memeriksa sesi admin...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-obsidian text-foreground">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-6 sm:px-6 md:px-9 md:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <AdminMobileDock />
    </div>
  );
}
