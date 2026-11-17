import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUSINESS_INFO } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-brand-deep text-white"
    >
      <img
        src="/hero.jpeg"
        alt="Unit Toyota Hilux rental mobil di Kota Kupang, Nusa Tenggara Timur"
        fetchPriority="high"
        width={1280}
        height={720}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#061B3AF2] via-[#092B59CC] to-[#092B5966] md:bg-gradient-to-r md:from-[#061B3AF2] md:via-[#092B59D9] md:to-transparent"
      />

      <div className="relative mx-auto flex min-h-[500px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:min-h-[600px] lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <Badge className="mb-5 gap-1.5 border border-brand-sky/40 bg-brand-navy/80 px-3.5 py-1.5 text-xs font-semibold text-brand-yellow">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {BUSINESS_INFO.location}
          </Badge>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[52px] lg:leading-[1.15]">
            Rental Mobil Kupang Murah, Lepas Kunci &amp; Dengan Sopir
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-200 sm:text-lg">
            Sewa mobil Kupang harian: Avanza, Innova Reborn, Brio, dan Hilux. Mobil bersih dan terawat untuk wisata,
            bisnis, dan keluarga.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button asChild variant="accent" size="lg">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Booking Sekarang
              </a>
            </Button>

            <Button asChild variant="outlineLight" size="lg">
              <a href="#katalog">Lihat Katalog</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

