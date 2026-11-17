import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppCtaSection() {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-brand-yellow px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 hidden h-72 w-72 rounded-full border-2 border-brand-navy/20 lg:block"
          />

          <div className="relative max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              Butuh Mobil untuk Perjalanan Anda?
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-brand-text sm:text-base">
              Hubungi kami sekarang dan temukan kendaraan yang sesuai dengan
              kebutuhan perjalanan Anda.
            </p>
          </div>

          <div className="relative mt-6 shrink-0 lg:mt-0">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Hubungi via WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

