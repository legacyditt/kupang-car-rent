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
            src="/about.jpeg"
            alt="Unit Toyota Avanza rental mobil Kupang siap antar jemput"
            loading="lazy"
            width={960}
            height={720}
            className="aspect-[4/3] w-full object-cover object-center"
          />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-brand-blue uppercase">
            Tentang Kami
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl lg:text-[34px]">
            Rental Mobil Terpercaya di Kupang
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

