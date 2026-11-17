import { createRoute } from "@tanstack/react-router";
import { CarCatalogSection } from "@/features/cars/components/CarCatalogSection";
import { AboutSection } from "@/features/landing/components/AboutSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { HowToBookSection } from "@/features/landing/components/HowToBookSection";
import { ServicesSection } from "@/features/landing/components/ServicesSection";
import { WhatsAppCtaSection } from "@/features/landing/components/WhatsAppCtaSection";
import { rootRoute } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
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

