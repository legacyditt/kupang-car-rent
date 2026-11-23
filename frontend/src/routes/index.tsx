import { createRoute } from "@tanstack/react-router";
import { GuestLayout } from "@/components/layout/GuestLayout";
import { CarCatalogSection } from "@/features/cars/components/CarCatalogSection";
import { AboutSection } from "@/features/landing/components/AboutSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { HowToBookSection } from "@/features/landing/components/HowToBookSection";
import { ServicesSection } from "@/features/landing/components/ServicesSection";
import { WhatsAppCtaSection } from "@/features/landing/components/WhatsAppCtaSection";
import { TestimonialsSection } from "@/features/testimonials/components/TestimonialsSection";
import {
  DEFAULT_DOCUMENT_TITLE,
  DEFAULT_ROBOTS_META,
  useDocumentMeta,
} from "@/lib/seo";
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

/** Halaman utama pelanggan: menyusun section beranda, katalog unit, layanan, alur booking, profil, dan CTA WhatsApp. */
function LandingPage() {
  useDocumentMeta({
    title: DEFAULT_DOCUMENT_TITLE,
    robots: DEFAULT_ROBOTS_META,
  });

  return (
    <>
      <HeroSection />
      <CarCatalogSection />
      <ServicesSection />
      <HowToBookSection />
      <AboutSection />
      <TestimonialsSection />
      <WhatsAppCtaSection />
    </>
  );
}
