import { createRoute } from "@tanstack/react-router";
import { GuestLayout } from "@/components/layout/GuestLayout";
import { CarCatalogSection } from "@/features/cars/components/CarCatalogSection";
import { AboutSection } from "@/features/landing/components/AboutSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { HowToBookSection } from "@/features/landing/components/HowToBookSection";
import { ServicesSection } from "@/features/landing/components/ServicesSection";
import { WhatsAppCtaSection } from "@/features/landing/components/WhatsAppCtaSection";
import { rootRoute } from "./__root";

export const guestLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "guest-layout",
  component: GuestLayout,
});

export const indexRoute = createRoute({
  getParentRoute: () => guestLayoutRoute,
  path: "/",
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <HeroSection />
      <CarCatalogSection />
      <ServicesSection />
      <HowToBookSection />
      <AboutSection />
      <WhatsAppCtaSection />
    </>
  );
}
