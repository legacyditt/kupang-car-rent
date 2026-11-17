import { MapPin, Phone } from "lucide-react";
import { BUSINESS_INFO, NAV_LINKS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer id="kontak" className="bg-brand-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-white">
              {BUSINESS_INFO.name.toUpperCase()}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              Layanan penyewaan mobil harian di Kota Kupang untuk kebutuhan
              wisata, perjalanan bisnis, dan keluarga.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-widest text-brand-yellow uppercase">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-300 transition-colors hover:text-brand-yellow"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-widest text-brand-yellow uppercase">
              Kontak
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-brand-yellow" aria-hidden="true" />
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-yellow transition-colors"
                >
                  WhatsApp: {BUSINESS_INFO.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" aria-hidden="true" />
                <span>{BUSINESS_INFO.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            © 2026 {BUSINESS_INFO.name}. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

