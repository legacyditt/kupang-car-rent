import { Check } from "lucide-react";

const REASONS = [
  "Kendaraan bersih dan terawat",
  "Pilihan layanan fleksibel",
  "Proses pemesanan mudah",
  "Komunikasi langsung melalui WhatsApp",
] as const;

export function AboutSection() {
  return (
    <section id="tentang" className="bg-brand-light py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-brand-navy shadow-md">
          <img
            src="/hero-kupang.jpg"
            alt="Layanan transportasi nyaman di Kota Kupang"
            loading="lazy"
            width={640}
            height={380}
            className="aspect-[16/10] w-full object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-brand-blue uppercase">
            Tentang Kami
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl lg:text-[34px]">
            Perjalanan Anda, Prioritas Kami
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brand-muted">
            Kami hadir untuk memberikan solusi transportasi yang aman, nyaman,
            dan terpercaya selama Anda berada di Kupang.
          </p>

          <ul className="mt-6 space-y-3">
            {REASONS.map((reason) => (
              <li
                key={reason}
                className="flex items-center gap-3 text-sm font-semibold text-brand-text sm:text-[15px]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-yellow">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

