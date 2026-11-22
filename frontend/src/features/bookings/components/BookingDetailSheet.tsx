import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  SERVICE_TYPE_LABELS,
  type RentalServiceType,
} from "@/features/cars/utils/booking";
import { formatRupiah } from "@/lib/utils";
import type {
  BookingItem,
  BookingStatus,
  PaymentScheme,
  PaymentStatus,
} from "../types/booking.types";
import {
  computePaymentSummary,
  yyyymmddToDdmmyyyy,
  type UpdateBookingDetailsInput,
} from "../utils/booking-admin";
import { readStoredCars } from "../utils/bookings-storage";
import { BookingCalendarPicker } from "./BookingCalendarPicker";
import { BookingPaymentPanel } from "./BookingPaymentPanel";
import { BookingStatusBadge } from "./BookingStatusBadge";

interface BookingDetailSheetProps {
  booking: BookingItem | null;
  conflict: BookingItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeStatus: (
    bookingId: string,
    nextStatus: BookingStatus,
    updates?: { finalPrice?: number; internalNote?: string }
  ) => { ok: true } | { ok: false; error: string };
  onSaveDetails: (
    bookingId: string,
    updates: { finalPrice: number; internalNote: string }
  ) => void;
  onEditBooking: (
    bookingId: string,
    patch: UpdateBookingDetailsInput
  ) => { ok: true } | { ok: false; error: string };
  onUpdatePayment?: (
    bookingId: string,
    updates: { paymentScheme: PaymentScheme; paymentStatus: PaymentStatus }
  ) => { ok: true } | { ok: false; error: string };
  onExtendBooking?: (
    bookingId: string,
    newEndDate: string
  ) => { ok: true } | { ok: false; error: string };
}

export function BookingDetailSheet({
  booking,
  conflict,
  open,
  onOpenChange,
  onChangeStatus,
  onSaveDetails,
  onEditBooking,
  onUpdatePayment,
  onExtendBooking,
}: BookingDetailSheetProps) {
  const [finalPrice, setFinalPrice] = useState("0");
  const [internalNote, setInternalNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCarId, setEditCarId] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editServiceType, setEditServiceType] =
    useState<RentalServiceType>("SELF_DRIVE");
  const [extendEndDate, setExtendEndDate] = useState("");

  const cars = useMemo(() => (open ? readStoredCars() : []), [open]);

  useEffect(() => {
    if (!booking) return;
    setFinalPrice(String(booking.finalPrice));
    setInternalNote(booking.internalNote);
    setActionError(null);
    setIsEditing(false);
    setEditName(booking.customerName);
    setEditPhone(booking.customerPhone);
    setEditCarId(booking.carId);
    setEditStartDate(booking.startDate);
    setEditEndDate(booking.endDate);
    setEditServiceType(booking.serviceType);
    setExtendEndDate(booking.endDate);
  }, [booking]);

  if (!booking) return null;

  const isPending = booking.status === "PENDING";
  const isEditable =
    booking.status === "PENDING" || booking.status === "CONFIRMED";
  const parsedPrice = Math.max(0, Number(finalPrice) || booking.finalPrice);

  const handleSaveEdit = () => {
    setActionError(null);
    const chosenCar = cars.find((c) => c.id === editCarId);
    const res = onEditBooking(booking.id, {
      customerName: editName,
      customerPhone: editPhone,
      carId: chosenCar?.id ?? booking.carId,
      carName: chosenCar?.name ?? booking.carName,
      pricePerDay: chosenCar?.pricePerDay,
      startDate: editStartDate,
      endDate: editEndDate,
      serviceType: editServiceType,
    });
    if (!res.ok) {
      setActionError(res.error);
      return;
    }
    setIsEditing(false);
  };

  const handleTransition = (nextStatus: BookingStatus) => {
    setActionError(null);
    const res = onChangeStatus(booking.id, nextStatus, {
      finalPrice: parsedPrice,
      internalNote,
    });
    if (!res.ok) {
      setActionError(res.error);
    }
  };

  const customerWaUrl = `https://wa.me/${booking.customerPhone}?text=${encodeURIComponent(
    `Halo ${booking.customerName}, terkait booking ${booking.bookingCode} (${booking.carName}, ${yyyymmddToDdmmyyyy(booking.startDate)} s/d ${yyyymmddToDdmmyyyy(booking.endDate)}).`
  )}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto border-l border-gold/25 bg-carbon p-6 text-white">
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-gold">
              {booking.bookingCode}
            </span>
            <BookingStatusBadge status={booking.status} />
          </div>
          <SheetTitle className="mt-1 font-display text-2xl font-bold text-white">
            {booking.customerName}
          </SheetTitle>
          <p className="mt-1 text-xs text-brand-muted">
            Detail permintaan sewa &amp; validasi ketersediaan jadwal.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {/* Spec Box */}
          <div className="space-y-2 rounded-xl border border-hairline bg-obsidian p-4 text-xs">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-sm font-bold text-white">
                {booking.carName}
              </p>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setIsEditing((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-1 font-mono text-[10px] text-brand-muted transition-colors hover:border-gold/50 hover:text-gold"
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  {isEditing ? "Tutup Edit" : "Edit"}
                </button>
              )}
            </div>

            {isEditing && isEditable ? (
              <div className="space-y-2.5 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    aria-label="Nama Pelanggan"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nama pelanggan"
                    className="h-8 border-hairline bg-carbon text-xs text-white"
                  />
                  <Input
                    aria-label="No. WhatsApp"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="No. WhatsApp"
                    className="h-8 border-hairline bg-carbon text-xs text-white"
                  />
                </div>
                <select
                  aria-label="Unit Mobil"
                  value={editCarId}
                  onChange={(e) => setEditCarId(e.target.value)}
                  className="h-8 w-full rounded-md border border-hairline bg-carbon px-2 text-xs text-white focus:border-gold focus:outline-none"
                >
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name} — {formatRupiah(car.pricePerDay)}/hari
                    </option>
                  ))}
                </select>
                <BookingCalendarPicker
                  mode="range"
                  carId={editCarId || booking.carId}
                  excludeBookingId={booking.id}
                  startDate={editStartDate}
                  endDate={editEndDate}
                  onChangeRange={(nextStart, nextEnd) => {
                    setEditStartDate(nextStart);
                    setEditEndDate(nextEnd);
                  }}
                  onError={setActionError}
                />
                <select
                  aria-label="Jenis Layanan"
                  value={editServiceType}
                  onChange={(e) =>
                    setEditServiceType(e.target.value as RentalServiceType)
                  }
                  className="h-8 w-full rounded-md border border-hairline bg-carbon px-2 text-xs text-white focus:border-gold focus:outline-none"
                >
                  <option value="SELF_DRIVE">
                    {SERVICE_TYPE_LABELS.SELF_DRIVE}
                  </option>
                  <option value="WITH_DRIVER">
                    {SERVICE_TYPE_LABELS.WITH_DRIVER}
                  </option>
                </select>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-8 w-full bg-gold font-mono text-[11px] font-bold text-obsidian uppercase hover:bg-gold-light"
                >
                  Simpan Perubahan
                </Button>
              </div>
            ) : (
              <>
                <p className="font-mono text-[11px] text-brand-muted">
                  Jadwal: {yyyymmddToDdmmyyyy(booking.startDate)} s/d{" "}
                  {yyyymmddToDdmmyyyy(booking.endDate)} ({booking.totalDays}{" "}
                  hari)
                </p>
                <p className="font-mono text-[11px] text-brand-muted">
                  Layanan: {SERVICE_TYPE_LABELS[booking.serviceType]}
                </p>
              </>
            )}

            {isPending && (
              <div className="pt-1">
                {conflict ? (
                  <p className="flex items-start gap-1.5 font-mono text-[11px] font-bold text-red-400">
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      Bentrok jadwal (BR-09) dengan {conflict.bookingCode} (
                      {conflict.customerName})
                    </span>
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-400">
                    <CheckCircle2
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>Tidak ada bentrok jadwal (BR-09)</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Final Price */}
          <div className="space-y-1.5">
            <Label
              htmlFor="booking-final-price"
              className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
            >
              Harga Final (Rp)
              {isEditable ? " — Editable" : ""}
            </Label>
            <Input
              id="booking-final-price"
              type="number"
              min={0}
              step={25000}
              disabled={!isEditable}
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              className="border-gold/35 bg-obsidian font-mono text-sm font-bold text-gold focus-visible:border-gold focus-visible:ring-0 disabled:opacity-70"
            />
          </div>

          {/* Payment Scheme & Status (stage-aware SoC component) */}
          {onUpdatePayment && (
            <BookingPaymentPanel
              booking={booking}
              onUpdatePayment={onUpdatePayment}
              onError={setActionError}
            />
          )}

          {/* Extend Rental while IN_PROGRESS */}
          {booking.status === "IN_PROGRESS" && onExtendBooking && (
            <div className="space-y-2.5 rounded-xl border border-sky-400/30 bg-sky-400/5 p-3.5 text-xs">
              <p className="font-mono text-[10px] font-bold tracking-wider text-sky-300 uppercase">
                Perpanjang Sewa (Sedang Jalan)
              </p>
              <BookingCalendarPicker
                mode="extend-end"
                carId={booking.carId}
                excludeBookingId={booking.id}
                startDate={booking.startDate}
                endDate={extendEndDate}
                minExtendEndDate={booking.endDate}
                onChangeExtendEnd={setExtendEndDate}
                onError={setActionError}
              />
              <Button
                type="button"
                size="sm"
                disabled={!extendEndDate || extendEndDate <= booking.endDate}
                onClick={() => {
                  setActionError(null);
                  const res = onExtendBooking(booking.id, extendEndDate);
                  if (!res.ok) setActionError(res.error);
                }}
                className="h-9 w-full bg-sky-500 font-mono text-[11px] font-bold text-obsidian uppercase hover:bg-sky-400 disabled:opacity-45"
              >
                Perpanjang Sewa →
              </Button>
            </div>
          )}

          {/* Internal Note */}
          <div className="space-y-1.5">
            <Label
              htmlFor="booking-internal-note"
              className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
            >
              Catatan Internal Admin
            </Label>
            <textarea
              id="booking-internal-note"
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Lokasi serah terima, nama sopir, atau catatan khusus..."
              className="w-full rounded-lg border border-hairline bg-obsidian p-3 text-xs text-white placeholder:text-brand-muted/60 focus:border-gold focus:outline-none"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onSaveDetails(booking.id, {
                  finalPrice: parsedPrice,
                  internalNote,
                })
              }
              className="h-8 border-hairline bg-obsidian font-mono text-[10px] text-brand-muted hover:text-white"
            >
              Simpan Catatan
            </Button>
          </div>

          {actionError && (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 font-mono text-xs text-red-300">
              {actionError}
            </p>
          )}

          {/* Status Actions */}
          <div className="space-y-2.5 border-t border-hairline pt-4">
            {isPending && (
              <>
                <Button
                  type="button"
                  variant="accent"
                  disabled={Boolean(conflict)}
                  onClick={() => handleTransition("CONFIRMED")}
                  className="h-11 w-full font-display text-xs tracking-wider uppercase"
                >
                  Konfirmasi Booking →
                </Button>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="h-10 border-hairline bg-obsidian font-mono text-[11px] font-bold text-white uppercase hover:border-gold/50 hover:text-gold"
                  >
                    <a
                      href={customerWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Chat WA
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTransition("REJECTED")}
                    className="h-10 border-red-400/40 bg-red-400/10 font-mono text-[11px] font-bold text-red-400 uppercase hover:bg-red-400/20 hover:text-red-300"
                  >
                    Tolak
                  </Button>
                </div>
              </>
            )}

            {booking.status === "CONFIRMED" && (
              <div className="space-y-2.5">
                <Button
                  type="button"
                  variant="accent"
                  onClick={() => handleTransition("IN_PROGRESS")}
                  className="h-11 w-full font-display text-xs tracking-wider uppercase"
                >
                  Mulai Sewa (Sedang Jalan) →
                </Button>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="h-10 border-hairline bg-obsidian font-mono text-[11px] font-bold text-white uppercase hover:border-gold/50 hover:text-gold"
                  >
                    <a
                      href={customerWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Chat WA
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTransition("CANCELLED")}
                    className="h-10 border-red-400/40 bg-red-400/10 font-mono text-[11px] font-bold text-red-400 uppercase hover:bg-red-400/20"
                  >
                    Batalkan
                  </Button>
                </div>
              </div>
            )}

            {booking.status === "IN_PROGRESS" &&
              (() => {
                // Payment-gated completion: tombol Tandai Selesai hanya aktif jika pembayaran sudah Lunas.
                const payment = computePaymentSummary(
                  booking.finalPrice,
                  booking.paymentScheme ?? "FULL",
                  booking.paymentStatus ?? "UNPAID",
                  booking.paidAmount
                );
                const isPaid =
                  payment.paymentStatus === "PAID" &&
                  payment.remainingAmount === 0;

                return (
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      variant="accent"
                      disabled={!isPaid}
                      onClick={() => handleTransition("COMPLETED")}
                      className="h-11 w-full font-display text-xs tracking-wider uppercase disabled:opacity-45"
                    >
                      Tandai Selesai →
                    </Button>
                    {!isPaid && (
                      <p className="text-center font-mono text-[10px] text-amber-300">
                        Lunasi pembayaran untuk mengaktifkan tombol selesai.
                      </p>
                    )}
                  </div>
                );
              })()}

            {(booking.status === "COMPLETED" ||
              booking.status === "REJECTED" ||
              booking.status === "CANCELLED") && (
              <Button
                type="button"
                variant="outline"
                asChild
                className="h-10 w-full border-hairline bg-obsidian font-mono text-[11px] font-bold text-white uppercase hover:border-gold/50 hover:text-gold"
              >
                <a
                  href={customerWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Hubungi Pelanggan via WA
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
