import { KeyRound, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatRupiah } from "@/lib/utils";
import type { CarItem } from "../types/car.types";
import { useBookingForm } from "../hooks/useBookingForm";
import {
  SERVICE_TYPE_LABELS,
  TRANSMISSION_LABELS,
  type RentalServiceType,
  type TransmissionPreference,
} from "../utils/booking";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const SERVICE_OPTIONS: Array<{
  value: RentalServiceType;
  label: string;
  icon: typeof KeyRound;
}> = [
  { value: "SELF_DRIVE", label: SERVICE_TYPE_LABELS.SELF_DRIVE, icon: KeyRound },
  {
    value: "WITH_DRIVER",
    label: SERVICE_TYPE_LABELS.WITH_DRIVER,
    icon: UserCheck,
  },
];

interface BookingModalProps {
  car: CarItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal booking pelanggan: pilih layanan & tanggal tersedia, simpan booking PENDING ke store, lalu arahkan ke WhatsApp admin. */
export function BookingModal({ car, open, onOpenChange }: BookingModalProps) {
  const {
    name,
    setName,
    phone,
    setPhone,
    serviceType,
    setServiceType,
    transmissionPreference,
    setTransmissionPreference,
    paymentScheme,
    setPaymentScheme,
    isDpEligible,
    dpAmount,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="booking-sheet inset-x-0 top-auto bottom-0 left-0 max-h-[90dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-t-2xl rounded-b-none border-t border-gold/25 bg-carbon p-6 text-white shadow-2xl data-[state=closed]:animate-none data-[state=open]:animate-none md:inset-0 md:m-auto md:h-fit md:max-h-[90dvh] md:w-[92vw] md:max-w-md md:rounded-2xl md:border md:border-gold/25">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline md:hidden"
        />

        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-lg font-bold tracking-tight text-white">
            Booking {car.name}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs font-medium text-gold">
            {formatRupiah(car.pricePerDay)} / hari
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor={`booking-name-${car.id}`}
              className="font-mono text-[11px] font-medium tracking-wider text-brand-muted uppercase"
            >
              Nama Lengkap
            </Label>
            <Input
              id={`booking-name-${car.id}`}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="h-10 rounded-lg border-hairline bg-obsidian px-3 text-sm text-white placeholder:text-brand-muted/60 focus-visible:border-gold focus-visible:ring-0"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`booking-phone-${car.id}`}
              className="font-mono text-[11px] font-medium tracking-wider text-brand-muted uppercase"
            >
              No. WhatsApp
            </Label>
            <Input
              id={`booking-phone-${car.id}`}
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="h-10 rounded-lg border-hairline bg-obsidian px-3 text-sm text-white placeholder:text-brand-muted/60 focus-visible:border-gold focus-visible:ring-0"
            />
          </div>

          <div>
            <Label className="mb-1.5 block font-mono text-[11px] font-medium tracking-wider text-brand-muted uppercase">
              Jenis Layanan
            </Label>
            <div
              role="radiogroup"
              aria-label="Jenis Layanan"
              className="grid grid-cols-2 gap-2"
            >
              {SERVICE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = serviceType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setServiceType(opt.value)}
                    className={cn(
                      "flex h-10 items-center justify-center gap-2 rounded-lg border font-mono text-xs font-medium transition-colors",
                      isSelected
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-hairline bg-obsidian text-brand-muted hover:border-gold/40 hover:text-white"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block font-mono text-[11px] font-medium tracking-wider text-brand-muted uppercase">
              Transmisi
            </Label>
            <div
              role="radiogroup"
              aria-label="Transmisi"
              className="grid grid-cols-2 gap-2"
            >
              {(["MATIC", "MANUAL"] as TransmissionPreference[]).map((opt) => {
                const isSelected = transmissionPreference === opt;
                const isAllowed =
                  !car.transmission ||
                  car.transmission === "BOTH" ||
                  car.transmission === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!isAllowed}
                    onClick={() => setTransmissionPreference(opt)}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-lg border font-mono text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                      isSelected
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-hairline bg-obsidian text-brand-muted hover:border-gold/40 hover:text-white"
                    )}
                  >
                    {TRANSMISSION_LABELS[opt]}
                  </button>
                );
              })}
            </div>
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
            <p className="font-mono text-xs font-medium text-red-400">
              {errorMsg}
            </p>
          )}

          {/* Payment Scheme Selector (DP 50% unlocked at >= 3 days) */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="font-mono text-[11px] font-medium tracking-wider text-brand-muted uppercase">
                Skema Pembayaran
              </Label>
              {!isDpEligible && (
                <span className="font-mono text-[10px] text-brand-muted text-gold">
                  DP 50% tersedia min. 3 hari
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentScheme("FULL")}
                className={cn(
                  "flex h-10 items-center justify-center rounded-lg border font-mono text-xs font-medium transition-colors",
                  paymentScheme === "FULL"
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-hairline bg-obsidian text-brand-muted hover:border-gold/40 hover:text-white"
                )}
              >
                Bayar Penuh
              </button>
              <button
                type="button"
                disabled={!isDpEligible}
                onClick={() => setPaymentScheme("DP_50")}
                className={cn(
                  "flex h-10 items-center justify-center rounded-lg border font-mono text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                  paymentScheme === "DP_50"
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-hairline bg-obsidian text-brand-muted hover:border-gold/40 hover:text-white"
                )}
              >
                DP 50%
              </button>
            </div>
          </div>

          <div className="space-y-1.5 rounded-xl border border-hairline bg-obsidian p-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-muted">Layanan</span>
              <span className="font-mono font-semibold text-white">
                {SERVICE_TYPE_LABELS[serviceType]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Transmisi</span>
              <span className="font-mono font-semibold text-white">
                {TRANSMISSION_LABELS[transmissionPreference]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Tanggal Mulai</span>
              <span className="font-mono font-semibold text-white">
                {startDate ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Tanggal Selesai</span>
              <span className="font-mono font-semibold text-white">
                {endDate ?? "—"}
              </span>
            </div>
            <div className="flex justify-between border-t border-hairline pt-2 text-sm">
              <span className="font-semibold text-white">
                Total ({totalDays} hari)
              </span>
              <span
                key={totalPrice}
                className="price-flash font-mono font-bold text-gold tabular-nums"
              >
                {totalDays > 0 ? formatRupiah(totalPrice) : "—"}
              </span>
            </div>
            {paymentScheme === "DP_50" && totalDays >= 3 && (
              <div className="flex justify-between border-t border-hairline pt-1.5 font-mono text-[11px] text-emerald-300">
                <span>DP 50% (Sisa {formatRupiah(totalPrice - dpAmount)})</span>
                <span className="font-bold tabular-nums">
                  {formatRupiah(dpAmount)}
                </span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            className="h-11 w-full rounded-md font-display text-xs tracking-wider uppercase"
            disabled={!startDate || !endDate}
          >
            Konfirmasi Booking →
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
