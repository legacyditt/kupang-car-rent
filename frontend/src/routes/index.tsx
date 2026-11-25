import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense, type ComponentType } from "react";
import { GuestLayout } from "@/components/layout/GuestLayout";
import { CarCatalogSection } from "@/features/cars/components/CarCatalogSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import {
  DEFAULT_DOCUMENT_TITLE,
  DEFAULT_ROBOTS_META,
  useDocumentMeta,
} from "@/lib/seo";
import { rootRoute } from "./__root";

/** Wraps named-export React components for `React.lazy` code-splitting without repeating `.then()` adapters. */
function lazyNamed<T extends ComponentType<Record<string, never>>>(
  loader: () => Promise<Record<string, T>>
) {
  return lazy(async () => {
    const mod = await loader();
    const firstExport = Object.values(mod)[0];
    return { default: firstExport };
  });
}

// Below-the-fold sections load lazily so mobile initial paint prioritizes hero + catalog.
const ServicesSection = lazyNamed(
  () => import("@/features/landing/components/ServicesSection")
);
const HowToBookSection = lazyNamed(
  () => import("@/features/landing/components/HowToBookSection")
);
const AboutSection = lazyNamed(
  () => import("@/features/landing/components/AboutSection")
);
const TestimonialsSection = lazyNamed(
  () => import("@/features/testimonials/components/TestimonialsSection")
);
const WhatsAppCtaSection = lazyNamed(
  () => import("@/features/landing/components/WhatsAppCtaSection")
);

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
      <Suspense fallback={null}>
        <ServicesSection />
        <HowToBookSection />
        <AboutSection />
        <TestimonialsSection />
        <WhatsAppCtaSection />
      </Suspense>
    </>
  );
}
