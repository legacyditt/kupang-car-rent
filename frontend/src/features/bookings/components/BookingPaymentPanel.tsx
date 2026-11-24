import { formatRupiah } from "@/lib/utils";
import type {
  BookingItem,
  PaymentScheme,
  PaymentStatus,
} from "../types/booking.types";
import {
  canUseDownPayment,
  computePaymentSummary,
  getAllowedPaymentStatuses,
  PAYMENT_SCHEME_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../utils/booking-admin";

interface BookingPaymentPanelProps {
  booking: BookingItem;
  onUpdatePayment: (
    bookingId: string,
    updates: { paymentScheme: PaymentScheme; paymentStatus: PaymentStatus }
  ) => Promise<{ ok: true } | { ok: false; error: string }> | { ok: true } | { ok: false; error: string };
  onError: (message: string | null) => void;
}

/**
 * Panel kontrol Skema & Status Pembayaran yang menyesuaikan tahap siklus booking:
 * - PENDING: hanya pilih skema bayar (FULL / DP_50).
 * - CONFIRMED / IN_PROGRESS: catat uang masuk tanpa mundur dari DP yang sudah tercatat.
 * - COMPLETED / REJECTED / CANCELLED: ringkasan read-only.
 */
export function BookingPaymentPanel({
  booking,
  onUpdatePayment,
  onError,
}: BookingPaymentPanelProps) {
  const dpEligible = canUseDownPayment(booking.totalDays);
  const currentScheme: PaymentScheme = dpEligible
    ? booking.paymentScheme ?? "FULL"
    : "FULL";
  const currentPayStatus: PaymentStatus = booking.paymentStatus ?? "UNPAID";
  const summary = computePaymentSummary(
    booking.finalPrice,
    currentScheme,
    currentPayStatus,
    booking.paidAmount
  );

  const canChangeScheme =
    booking.status === "PENDING" || booking.status === "CONFIRMED";
  const canRecordPayment =
    booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS";

  // Pada IN_PROGRESS jika sudah DP_PAID, opsi mundur (UNPAID / DP_PAID) dinonaktifkan agar fokus ke pelunasan.
  const allowedNextStatuses = getAllowedPaymentStatuses(
    booking.status,
    currentScheme,
    currentPayStatus
  );
  const statusOptions: PaymentStatus[] =
    currentScheme === "DP_50"
      ? ["UNPAID", "DP_PAID", "PAID"]
      : ["UNPAID", "PAID"];

  return (
    <div className="space-y-2.5 rounded-xl border border-hairline bg-obsidian p-3.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
          Pembayaran
        </span>
        <span className="font-mono text-[10px] font-bold text-gold">
          {PAYMENT_SCHEME_LABELS[currentScheme]} •{" "}
          {PAYMENT_STATUS_LABELS[currentPayStatus]}
        </span>
      </div>

      {(canChangeScheme || canRecordPayment) && (
        <div
          className={
            canChangeScheme && canRecordPayment
              ? "grid grid-cols-2 gap-2"
              : "grid grid-cols-1 gap-2"
          }
        >
          {canChangeScheme && (
            <select
              aria-label="Skema Pembayaran"
              value={currentScheme}
              disabled={!dpEligible}
              onChange={async (e) => {
                onError(null);
                const res = await onUpdatePayment(booking.id, {
                  paymentScheme: e.target.value as PaymentScheme,
                  paymentStatus: currentPayStatus,
                });
                if (!res.ok) onError(res.error);
              }}
              className="h-8 rounded-md border border-hairline bg-carbon px-2 font-mono text-[11px] text-white disabled:opacity-50"
            >
              <option value="FULL">{PAYMENT_SCHEME_LABELS.FULL}</option>
              <option value="DP_50">
                {PAYMENT_SCHEME_LABELS.DP_50} (min. 3 hari)
              </option>
            </select>
          )}

          {canRecordPayment && (
            <select
              aria-label="Status Pembayaran"
              value={currentPayStatus}
              disabled={
                booking.status === "IN_PROGRESS" && currentPayStatus === "PAID"
              }
              onChange={async (e) => {
                onError(null);
                const res = await onUpdatePayment(booking.id, {
                  paymentScheme: currentScheme,
                  paymentStatus: e.target.value as PaymentStatus,
                });
                if (!res.ok) onError(res.error);
              }}
              className="h-8 rounded-md border border-hairline bg-carbon px-2 font-mono text-[11px] text-white disabled:opacity-60"
            >
              {statusOptions.map((statusOpt) => {
                const isCurrent = statusOpt === currentPayStatus;
                const isAllowed = allowedNextStatuses.includes(statusOpt);
                return (
                  <option
                    key={statusOpt}
                    value={statusOpt}
                    disabled={!isCurrent && !isAllowed}
                  >
                    {PAYMENT_STATUS_LABELS[statusOpt]}
                    {statusOpt === "DP_PAID" ? " (50%)" : ""}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      )}

      {booking.status === "PENDING" ? (
        <p className="font-mono text-[10px] text-brand-muted">
          Catat DP / Pelunasan aktif setelah booking dikonfirmasi.
        </p>
      ) : (
        <div className="flex justify-between font-mono text-[11px]">
          <span className="text-brand-muted">
            Masuk: {formatRupiah(summary.paidAmount)}
          </span>
          <span
            className={
              summary.remainingAmount > 0
                ? "font-bold text-amber-300"
                : "font-bold text-emerald-400"
            }
          >
            {summary.remainingAmount > 0
              ? `Sisa: ${formatRupiah(summary.remainingAmount)}`
              : "Lunas"}
          </span>
        </div>
      )}
    </div>
  );
}

