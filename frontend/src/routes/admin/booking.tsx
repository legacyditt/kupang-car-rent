import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingDetailSheet } from "@/features/bookings/components/BookingDetailSheet";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import { useAdminBookings } from "@/features/bookings/hooks/useAdminBookings";
import {
  BOOKING_STATUS_LABELS,
  type BookingFilterTab,
} from "@/features/bookings/utils/booking-admin";
import { SERVICE_TYPE_LABELS } from "@/features/cars/utils/booking";
import { cn, formatRupiah } from "@/lib/utils";

const FILTER_TABS: Array<{ value: BookingFilterTab; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: BOOKING_STATUS_LABELS.PENDING },
  { value: "CONFIRMED", label: BOOKING_STATUS_LABELS.CONFIRMED },
  { value: "IN_PROGRESS", label: BOOKING_STATUS_LABELS.IN_PROGRESS },
  { value: "COMPLETED", label: BOOKING_STATUS_LABELS.COMPLETED },
  { value: "REJECTED", label: BOOKING_STATUS_LABELS.REJECTED },
  { value: "CANCELLED", label: BOOKING_STATUS_LABELS.CANCELLED },
];

export function AdminBookingsPage() {
  const {
    filteredBookings,
    counts,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedBooking,
    selectedConflict,
    setSelectedId,
    changeStatus,
    saveNotesAndPrice,
  } = useAdminBookings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
          03 / Manajemen Booking
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Daftar Permintaan &amp; Jadwal.
        </h1>
      </div>

      {/* Search & Status Tabs */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode booking, nama pelanggan, atau unit..."
            className="h-10 border-hairline bg-carbon pl-9 text-sm text-white placeholder:text-brand-muted/70 focus-visible:border-gold focus-visible:ring-0"
          />
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as BookingFilterTab)}
        >
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg border border-hairline bg-carbon px-3 py-1.5 font-mono text-[11px] font-medium text-brand-muted uppercase data-[state=active]:border-gold/50 data-[state=active]:bg-gold/15 data-[state=active]:font-bold data-[state=active]:text-gold"
              >
                {tab.label} ({counts[tab.value]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-carbon p-10 text-center">
          <p className="font-display text-base font-bold text-white">
            Tidak ada data booking
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Ubah kata kunci pencarian atau pilih tab status lainnya.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const isSelected = selectedBooking?.id === booking.id;
            return (
              <Card
                key={booking.id}
                onClick={() => setSelectedId(booking.id)}
                className={cn(
                  "cursor-pointer rounded-xl bg-carbon py-0 text-white transition-colors",
                  isSelected
                    ? "border-gold/60"
                    : "border-hairline hover:border-gold/40"
                )}
              >
                <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold text-gold">
                      {booking.bookingCode}{" "}
                      <span className="text-white">
                        • {booking.customerName}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-xs text-brand-muted">
                      {booking.carName} • {booking.startDate} s/d{" "}
                      {booking.endDate} ({booking.totalDays} hari) •{" "}
                      {SERVICE_TYPE_LABELS[booking.serviceType]}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="font-mono text-xs font-bold text-white tabular-nums">
                      {formatRupiah(booking.finalPrice)}
                    </span>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <BookingDetailSheet
        booking={selectedBooking}
        conflict={selectedConflict}
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onChangeStatus={changeStatus}
        onSaveDetails={saveNotesAndPrice}
      />
    </div>
  );
}

