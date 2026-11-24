import { MapPin, Phone } from "lucide-react";
import { useBusinessProfile } from "@/features/business-profile/hooks/useBusinessProfile";
import { NAV_LINKS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  const { profile } = useBusinessProfile();

  return (
    <footer id="kontak" className="border-t border-hairline bg-[#030406] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-6 md:pb-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <img
              src={profile.logoPath}
              alt={`${profile.name} Logo`}
              width={162}
              height={48}
              className="h-11 w-auto object-contain"
            />
            <p className="mt-4 font-mono text-xs tracking-wider text-gold uppercase">
              {profile.tagline}
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-muted">
              {profile.description}
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold tracking-widest text-gold uppercase">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-mono text-xs tracking-wider text-slate-300 uppercase transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold tracking-widest text-gold uppercase">
              Reservasi 24/7
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-lg font-bold text-white transition-colors hover:text-gold"
                >
                  {profile.whatsappDisplayIntl}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span className="text-brand-muted">{profile.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-hairline pt-6">
          <p className="font-mono text-[11px] tracking-wider text-slate-500 uppercase">
            © 2026 {profile.name.toUpperCase()} KUPANG
          </p>
        </div>
      </div>
    </footer>
  );
}

