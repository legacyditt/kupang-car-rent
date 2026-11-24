import { ChevronLeft, ChevronRight, Plus, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AddBookingDialog } from "@/features/bookings/components/AddBookingDialog";
import { BookingDetailSheet } from "@/features/bookings/components/BookingDetailSheet";
import { useAdminBookings } from "@/features/bookings/hooks/useAdminBookings";
import type { BookingStatus } from "@/features/bookings/types/booking.types";
import { buildCalendarBoardCells } from "@/features/bookings/utils/calendar-board";
import { useAdminCars } from "@/features/cars/hooks/useAdminCars";
import { DAY_HEADERS, MONTH_NAMES } from "@/features/cars/utils/booking";
import { cn } from "@/lib/utils";

const STATUS_PILL_STYLES: Record<
  Extract<
    BookingStatus,
    "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED"
  >,
  string
> = {
  PENDING: "border-gold/40 bg-gold/15 text-gold",
  CONFIRMED: "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
  IN_PROGRESS: "border-sky-400/40 bg-sky-400/15 text-sky-300",
  COMPLETED: "border-hairline bg-obsidian/80 text-brand-muted",
};

const LEGEND_ITEMS = [
  { label: "PENDING", dotClass: "bg-gold" },
  { label: "CONFIRMED", dotClass: "bg-emerald-400" },
  { label: "IN PROGRESS", dotClass: "bg-sky-400" },
  { label: "COMPLETED", dotClass: "bg-slate-400" },
  { label: "MAINTENANCE", dotClass: "bg-amber-500" },
] as const;

function getTodayYyyymmdd(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AdminCalendarPage() {
  const {
    bookings,
    selectedBooking,
    selectedConflict,
    setSelectedId,
    changeStatus,
    saveNotesAndPrice,
    addBooking,
    editBooking,
    updatePayment,
    extendBooking,
  } = useAdminBookings();
  const { cars } = useAdminCars();
  const todayStr = useMemo(() => getTodayYyyymmdd(), []);

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [carFilter, setCarFilter] = useState<string>("ALL");
  const [addTargetDate, setAddTargetDate] = useState<string | null>(null);

  const cells = useMemo(
    () =>
      buildCalendarBoardCells(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        bookings,
        carFilter
      ),
    [viewDate, bookings, carFilter]
  );

  const selectedUnit = useMemo(
    () => cars.find((c) => c.id === carFilter) ?? null,
    [cars, carFilter]
  );

  const maintenanceCars = useMemo(
    () => cars.filter((c) => c.status === "MAINTENANCE"),
    [cars]
  );

  return (
    <div className="space-y-6">
      {/* Header + Month Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
            Kalender Penyewaan
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Jadwal Armada Bulanan.
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Bulan sebelumnya"
            onClick={() =>
              setViewDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
              )
            }
            className="h-9 w-9 border-hairline bg-carbon text-brand-muted hover:border-gold/50 hover:text-gold"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[150px] text-center font-display text-sm font-bold text-white">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Bulan berikutnya"
            onClick={() =>
              setViewDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
              )
            }
            className="h-9 w-9 border-hairline bg-carbon text-brand-muted hover:border-gold/50 hover:text-gold"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Unit Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCarFilter("ALL")}
          className={cn(
            "rounded-lg border px-3 py-1.5 font-mono text-[11px] font-medium uppercase transition-colors",
            carFilter === "ALL"
              ? "border-gold/50 bg-gold/15 font-bold text-gold"
              : "border-hairline bg-carbon text-brand-muted hover:border-gold/30 hover:text-white"
          )}
        >
          Semua Unit
        </button>
        {cars.map((car) => {
          const isActive = carFilter === car.id;
          const isMaintenance = car.status === "MAINTENANCE";
          return (
            <button
              key={car.id}
              type="button"
              onClick={() => setCarFilter(car.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-medium transition-colors",
                isActive
                  ? "border-gold/50 bg-gold/15 font-bold text-gold"
                  : "border-hairline bg-carbon text-brand-muted hover:border-gold/30 hover:text-white"
              )}
            >
              <span>{car.name}</span>
              {isMaintenance && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase">
                  <Wrench className="h-2.5 w-2.5" aria-hidden="true" />
                  MAINTENANCE
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Global Maintenance Banner */}
      {(selectedUnit?.status === "MAINTENANCE" ||
        (carFilter === "ALL" && maintenanceCars.length > 0)) && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          <Wrench className="h-4 w-4 shrink-0 text-amber-400" />
          <p>
            Unit berstatus <span className="font-mono font-bold">MAINTENANCE</span>:{" "}
            {selectedUnit
              ? selectedUnit.name
              : maintenanceCars.map((c) => c.name).join(", ")}
            .
          </p>
        </div>
      )}

      {/* Calendar Board */}
      <div className="rounded-2xl border border-hairline bg-carbon p-4">
        <div className="grid grid-cols-7 gap-2 border-b border-hairline pb-2 text-center font-mono text-[10px] font-bold tracking-wider text-brand-muted uppercase">
          {DAY_HEADERS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {cells.map((cell) => {
            const isToday = cell.dateStr === todayStr;
            return (
              <div
                key={cell.dateStr}
                onClick={() => setAddTargetDate(cell.dateStr)}
                className={cn(
                  "group min-h-[96px] cursor-pointer rounded-xl border p-2 transition-colors hover:border-gold/40",
                  cell.isCurrentMonth
                    ? "border-hairline bg-obsidian/70"
                    : "border-hairline/40 bg-obsidian/25 opacity-55",
                  isToday && "border-gold/60 bg-gold/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono text-[11px] font-bold",
                      isToday ? "text-gold" : "text-slate-300"
                    )}
                  >
                    {cell.dayNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    {isToday && (
                      <span className="font-mono text-[9px] font-bold text-gold uppercase">
                        Hari Ini
                      </span>
                    )}
                    <Plus
                      className="h-3 w-3 text-brand-muted opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="mt-1.5 space-y-1">
                  {cell.bookings.map((booking) => {
                    const style =
                      STATUS_PILL_STYLES[
                        booking.status as keyof typeof STATUS_PILL_STYLES
                      ] ?? STATUS_PILL_STYLES.COMPLETED;
                    return (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(booking.id);
                        }}
                        title={`${booking.carName} • ${booking.customerName} (${booking.status})`}
                        className={cn(
                          "block w-full truncate rounded border px-1.5 py-0.5 text-left font-mono text-[10px] font-medium transition-opacity hover:opacity-85",
                          style
                        )}
                      >
                        {booking.carName} • {booking.customerName}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-hairline pt-3 font-mono text-[10px] text-brand-muted">
          {LEGEND_ITEMS.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span
                className={cn("inline-block h-2 w-2 rounded-full", item.dotClass)}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <BookingDetailSheet
        booking={selectedBooking}
        conflict={selectedConflict}
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onChangeStatus={changeStatus}
        onSaveDetails={saveNotesAndPrice}
        onEditBooking={editBooking}
        onUpdatePayment={updatePayment}
        onExtendBooking={extendBooking}
      />

      <AddBookingDialog
        open={Boolean(addTargetDate)}
        onOpenChange={(open) => {
          if (!open) setAddTargetDate(null);
        }}
        existingBookings={bookings}
        initialCarId={carFilter !== "ALL" ? carFilter : undefined}
        initialDate={addTargetDate ?? undefined}
        onCreateBooking={addBooking}
      />
    </div>
  );
}

