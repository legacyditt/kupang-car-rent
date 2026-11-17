import { CalendarDays, CarFront, CheckCircle2, FileText } from "lucide-react";

const BOOKING_STEPS = [
  {
    step: 1,
    title: "Pilih Mobil",
    description: "Tentukan kendaraan sesuai kebutuhan.",
    icon: CarFront,
    isFinal: false,
  },
  {
    step: 2,
    title: "Tentukan Jadwal",
    description: "Pilih tanggal mulai dan selesai penyewaan.",
    icon: CalendarDays,
    isFinal: false,
  },
  {
    step: 3,
    title: "Isi Data Pemesanan",
    description: "Masukkan nama dan nomor WhatsApp.",
    icon: FileText,
    isFinal: false,
  },
  {
    step: 4,
    title: "Konfirmasi Booking",
    description:
      "Admin akan menghubungi Anda melalui WhatsApp untuk konfirmasi.",
    icon: CheckCircle2,
    isFinal: true,
  },
] as const;

export function HowToBookSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold tracking-[0.14em] text-brand-blue uppercase">
          Cara Pemesanan
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl lg:text-[34px]">
          Booking Mobil dengan Mudah
        </h2>

        <div className="relative mt-10 grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
          <div
            aria-hidden="true"
            className="absolute left-6 top-6 hidden h-0.5 w-[calc(100%-12rem)] bg-slate-200 md:block"
          />

          {BOOKING_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex items-start gap-4 md:flex-col md:gap-0"
              >
                <div
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                    item.isFinal
                      ? "bg-brand-yellow text-brand-navy"
                      : "bg-brand-navy text-brand-yellow"
                  }`}
                >
                  <span className="sr-only">Langkah {item.step}: </span>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="md:mt-5">
                  <span className="text-xs font-bold text-brand-blue">
                    Langkah {item.step}
                  </span>
                  <h3 className="mt-0.5 text-base font-bold text-brand-text sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

