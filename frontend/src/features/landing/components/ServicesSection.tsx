import { ArrowRight, KeyRound, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SERVICES = [
  {
    title: "Dengan Sopir",
    description:
      "Nikmati perjalanan lebih nyaman tanpa perlu mengemudi sendiri. Cocok untuk wisata, perjalanan bisnis, dan kebutuhan keluarga.",
    note: "Rekomendasi untuk perjalanan wisata & dinas",
    icon: UserCheck,
    iconBg: "bg-brand-navy",
  },
  {
    title: "Tanpa Sopir (Lepas Kunci)",
    description:
      "Lebih fleksibel mengatur perjalanan Anda sendiri dengan kendaraan pilihan.",
    note: "Kebebasan penuh menentukan rute & jadwal",
    icon: KeyRound,
    iconBg: "bg-brand-blue",
  },
] as const;

export function ServicesSection() {
  return (
    <section id="layanan" className="bg-brand-light py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold tracking-[0.14em] text-brand-blue uppercase">
          Layanan Kami
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl lg:text-[34px]">
          Rental Mobil Kupang Lepas Kunci &amp; Dengan Sopir
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.title}
                className="rounded-[14px] border-blue-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-brand-yellow ${service.iconBg}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-brand-navy sm:text-xl">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-[15px]">
                      {service.description}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue sm:text-sm">
                      {service.note}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

