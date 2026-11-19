import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { SERVICE_TYPE_LABELS } from "@/features/cars/utils/booking";
import type { BookingItem, BookingStatus } from "../types/booking.types";
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
}

export function BookingDetailSheet({
  booking,
  conflict,
  open,
  onOpenChange,
  onChangeStatus,
  onSaveDetails,
}: BookingDetailSheetProps) {
  const [finalPrice, setFinalPrice] = useState("0");
  const [internalNote, setInternalNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;
    setFinalPrice(String(booking.finalPrice));
    setInternalNote(booking.internalNote);
    setActionError(null);
  }, [booking]);

  if (!booking) return null;

  const isPending = booking.status === "PENDING";
  const parsedPrice = Math.max(0, Number(finalPrice) || booking.finalPrice);

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
    `Halo ${booking.customerName}, terkait booking ${booking.bookingCode} (${booking.carName}, ${booking.startDate} s/d ${booking.endDate}).`
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
            <p className="font-display text-sm font-bold text-white">
              {booking.carName}
            </p>
            <p className="font-mono text-[11px] text-brand-muted">
              Jadwal: {booking.startDate} s/d {booking.endDate} (
              {booking.totalDays} hari)
            </p>
            <p className="font-mono text-[11px] text-brand-muted">
              Layanan: {SERVICE_TYPE_LABELS[booking.serviceType]}
            </p>

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
              Harga Final (Rp){isPending ? " — Editable Sebelum Konfirmasi" : ""}
            </Label>
            <Input
              id="booking-final-price"
              type="number"
              min={0}
              step={25000}
              disabled={!isPending}
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              className="border-gold/35 bg-obsidian font-mono text-sm font-bold text-gold focus-visible:border-gold focus-visible:ring-0 disabled:opacity-70"
            />
          </div>

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

            {booking.status === "IN_PROGRESS" && (
              <Button
                type="button"
                variant="accent"
                onClick={() => handleTransition("COMPLETED")}
                className="h-11 w-full font-display text-xs tracking-wider uppercase"
              >
                Tandai Selesai →
              </Button>
            )}

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
