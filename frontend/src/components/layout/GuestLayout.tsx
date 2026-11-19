import { Outlet } from "@tanstack/react-router";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomDock } from "@/components/layout/MobileBottomDock";
import { Navbar } from "@/components/layout/Navbar";

export function GuestLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-obsidian text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomDock />
    </div>
  );
}

