import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAdminCars } from "@/features/cars/hooks/useAdminCars";
import { CAR_STATUS_LABELS } from "@/features/cars/utils/car-admin";
import { apiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

interface DashboardSummaryDto {
  carStats: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    inactive: number;
  };
  bookingStats: {
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    rejected: number;
    cancelled: number;
  };
  recentBookings: Array<{
    id: string;
    bookingCode: string;
    customerName: string;
    carName: string;
    startDate: string;
    endDate: string;
    finalPrice: number;
    status: string;
    paymentStatus: string;
  }>;
}

const STATUS_BADGE_STYLE: Record<string, string> = {
  PENDING: "border-gold/40 bg-gold/15 text-gold",
  IN_PROGRESS: "border-sky-400/40 bg-sky-400/15 text-sky-400",
  CONFIRMED: "border-emerald-400/40 bg-emerald-400/15 text-emerald-400",
  COMPLETED: "border-emerald-400/40 bg-emerald-400/15 text-emerald-400",
};

const CAR_STATUS_COLOR: Record<string, string> = {
  AVAILABLE: "text-emerald-400",
  RENTED: "text-sky-400",
  MAINTENANCE: "text-red-400",
  INACTIVE: "text-brand-muted",
};

export function AdminOverviewPage() {
  const { cars } = useAdminCars();
  const { data: summary } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiFetch<DashboardSummaryDto>("/admin/dashboard/summary"),
  });

  const totalCars = summary?.carStats.total ?? cars.length;
  const availableCars = summary?.carStats.available ?? 0;
  const pendingCount = summary?.bookingStats.pending ?? 0;
  const activeCount = summary?.bookingStats.inProgress ?? 0;
  const confirmedCount = summary?.bookingStats.confirmed ?? 0;
  const recentBookings = summary?.recentBookings ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
            Dashboard Overview
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ringkasan Operasional.
          </h1>
        </div>

        <div className="flex items-center gap-3">
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
            {totalCars} Unit
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-emerald-400">
            {availableCars} Tersedia siap jalan
          </p>
        </div>

        <div className="rounded-xl border border-gold/40 bg-carbon p-4 sm:p-5">
          <p className="font-mono text-[10px] font-bold tracking-[0.12em] text-gold uppercase">
            Booking Pending
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-gold tabular-nums sm:text-3xl">
            {pendingCount} Menunggu
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
            {activeCount} Aktif
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-brand-muted">
            {confirmedCount} Confirmed
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-hairline bg-carbon p-4 sm:p-5 lg:col-span-1">
          <p className="font-mono text-[10px] tracking-[0.12em] text-brand-muted uppercase">
            Total Booking
          </p>
          <p className="mt-2 font-mono text-xl font-bold text-white tabular-nums sm:text-2xl">
            {summary?.bookingStats.total ?? 0} Transaksi
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-emerald-400">
            {summary?.bookingStats.completed ?? 0} Selesai
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
            {recentBookings.map((booking) => (
              <div
                key={booking.bookingCode}
                className="flex flex-col justify-between gap-3 rounded-xl border border-hairline bg-obsidian p-3.5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold text-gold">
                    {booking.bookingCode}{" "}
                    <span className="text-white">• {booking.customerName}</span>
                  </p>
                  <p className="mt-1 truncate text-xs text-brand-muted">
                    {booking.carName} • {booking.startDate} s/d {booking.endDate}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="font-mono text-xs font-bold text-white tabular-nums">
                    {formatRupiah(booking.finalPrice)}
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
            Status Unit Hari Ini
          </h2>

          <div className="mt-4 space-y-2.5">
            {cars.map((car) => (
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
                  ● {CAR_STATUS_LABELS[car.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
