import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import type { CarItem } from "../types/car.types";
import { useBookingForm } from "../hooks/useBookingForm";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

interface BookingModalProps {
  car: CarItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingModal({ car, open, onOpenChange }: BookingModalProps) {
  const {
    name,
    setName,
    startDate,
    endDate,
    viewDate,
    todayIso,
    bookedSet,
    calendarCells,
    totalDays,
    totalPrice,
    errorMsg,
    handleDateClick,
    handlePrevMonth,
    handleNextMonth,
    handleSubmit,
  } = useBookingForm(car, () => onOpenChange(false));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-brand-navy">
                Booking {car.name}
              </DialogPrimitive.Title>
              <p className="text-xs text-brand-muted">
                {formatRupiah(car.pricePerDay)} / hari
              </p>
            </div>
            <DialogPrimitive.Close
              className="rounded-md p-1 text-brand-muted hover:bg-slate-100"
              aria-label="Tutup form booking"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor={`booking-name-${car.id}`}
                className="mb-1 block text-xs font-semibold text-brand-text"
              >
                Nama Lengkap
              </label>
              <input
                id={`booking-name-${car.id}`}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-navy focus:outline-none"
              />
            </div>

            <AvailabilityCalendar
              viewDate={viewDate}
              calendarCells={calendarCells}
              todayIso={todayIso}
              bookedSet={bookedSet}
              startDate={startDate}
              endDate={endDate}
              onSelectDate={handleDateClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />

            {errorMsg && (
              <p className="text-xs font-medium text-red-600">{errorMsg}</p>
            )}

            <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-muted">Tanggal Mulai</span>
                <span className="font-semibold">{startDate ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Tanggal Selesai</span>
                <span className="font-semibold">{endDate ?? "—"}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 text-sm">
                <span className="font-semibold text-brand-text">
                  Total ({totalDays} hari)
                </span>
                <span className="font-bold text-brand-navy">
                  {totalDays > 0 ? formatRupiah(totalPrice) : "—"}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!startDate || !endDate}
            >
              Konfirmasi Booking
            </Button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}