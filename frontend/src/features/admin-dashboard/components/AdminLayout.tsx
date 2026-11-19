import { Outlet } from "@tanstack/react-router";
import { AdminMobileDock } from "./AdminMobileDock";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
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

