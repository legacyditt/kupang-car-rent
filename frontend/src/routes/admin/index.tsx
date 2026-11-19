import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { INITIAL_CARS } from "@/features/cars/data/cars.mock";
import { formatRupiah } from "@/lib/utils";

const RECENT_BOOKINGS = [
  {
    code: "BK-20261119-A001",
    customer: "Delano K.",
    summary: "Toyota Avanza • 26–30 Nov (5 hari) • Lepas Kunci",
    price: 1_500_000,
    status: "PENDING",
  },
  {
    code: "BK-20261118-B014",
    customer: "Maria N.",
    summary: "Toyota Innova Reborn • 19–21 Nov (3 hari) • Dengan Sopir",
    price: 900_000,
    status: "IN_PROGRESS",
  },
  {
    code: "BK-20261117-C008",
    customer: "Hendra P.",
    summary: "Honda Brio • 22–23 Nov (2 hari) • Lepas Kunci",
    price: 600_000,
    status: "CONFIRMED",
  },
] as const;

const STATUS_BADGE_STYLE: Record<string, string> = {
  PENDING: "border-gold/40 bg-gold/15 text-gold",
  IN_PROGRESS: "border-sky-400/40 bg-sky-400/15 text-sky-400",
  CONFIRMED: "border-emerald-400/40 bg-emerald-400/15 text-emerald-400",
};

const CAR_STATUS_COLOR: Record<string, string> = {
  AVAILABLE: "text-emerald-400",
  RENTED: "text-sky-400",
  MAINTENANCE: "text-red-400",
  INACTIVE: "text-brand-muted",
};

export function AdminOverviewPage() {
  const availableCount = INITIAL_CARS.filter((c) => c.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
            01 / Dashboard Overview
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ringkasan Operasional.
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-lg border border-hairline bg-carbon px-3.5 py-2 font-mono text-[11px] text-brand-muted uppercase sm:inline-flex">
            Kam, 19 Nov 2026
          </span>
          <Button
            asChild
            variant="accent"
            className="h-10 rounded-lg px-4 font-display text-xs tracking-wider uppercase"
          >
            <Link to="/admin/mobil">+ Tambah Unit</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-hairline bg-carbon p-4 sm:p-5">
          <p className="font-mono text-[10px] tracking-[0.12em] text-brand-muted uppercase">
            Total Armada
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums sm:text-3xl">
            {INITIAL_CARS.length} Unit
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-emerald-400">
            {availableCount} Tersedia siap jalan
          </p>
        </div>

        <div className="rounded-xl border border-gold/40 bg-carbon p-4 sm:p-5">
          <p className="font-mono text-[10px] font-bold tracking-[0.12em] text-gold uppercase">
            Booking Pending
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-gold tabular-nums sm:text-3xl">
            3 Menunggu
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-brand-muted">
            Perlu konfirmasi admin
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-carbon p-4 sm:p-5">
          <p className="font-mono text-[10px] tracking-[0.12em] text-brand-muted uppercase">
            Sedang Disewa
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-sky-400 tabular-nums sm:text-3xl">
            1 Aktif
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-brand-muted">
            2 Confirmed minggu ini
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-hairline bg-carbon p-4 sm:p-5 lg:col-span-1">
          <p className="font-mono text-[10px] tracking-[0.12em] text-brand-muted uppercase">
            Estimasi Bulan Ini
          </p>
          <p className="mt-2 font-mono text-xl font-bold text-white tabular-nums sm:text-2xl">
            Rp 4.800.000
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-emerald-400">
            8 Booking Selesai/Aktif
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent Bookings */}
        <section className="rounded-2xl border border-hairline bg-carbon p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-white">
              Permintaan Booking Terbaru
            </h2>
            <Link
              to="/admin/booking"
              className="font-mono text-[11px] font-bold tracking-wider text-gold uppercase hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {RECENT_BOOKINGS.map((booking) => (
              <div
                key={booking.code}
                className="flex flex-col justify-between gap-3 rounded-xl border border-hairline bg-obsidian p-3.5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold text-gold">
                    {booking.code}{" "}
                    <span className="text-white">• {booking.customer}</span>
                  </p>
                  <p className="mt-1 truncate text-xs text-brand-muted">
                    {booking.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="font-mono text-xs font-bold text-white tabular-nums">
                    {formatRupiah(booking.price)}
                  </span>
                  <span
                    className={`rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${
                      STATUS_BADGE_STYLE[booking.status] ??
                      "border-hairline text-brand-muted"
                    }`}
                  >
                    {booking.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fleet Status */}
        <section className="rounded-2xl border border-hairline bg-carbon p-5">
          <h2 className="font-display text-base font-bold text-white">
            Status Armada Hari Ini
          </h2>

          <div className="mt-4 space-y-2.5">
            {INITIAL_CARS.map((car) => (
              <div
                key={car.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-hairline bg-obsidian px-3.5 py-3"
              >
                <span className="truncate text-xs font-bold text-white">
                  {car.name}
                </span>
                <span
                  className={`shrink-0 font-mono text-[10px] font-bold uppercase ${
                    CAR_STATUS_COLOR[car.status] ?? "text-brand-muted"
                  }`}
                >
                  ● {car.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
