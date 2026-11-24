import { FileSpreadsheet, FileText, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminBookings } from "@/features/bookings/hooks/useAdminBookings";
import { useBusinessProfile } from "@/features/business-profile/hooks/useBusinessProfile";
import {
  exportFinanceToExcel,
  exportFinanceToPdf,
} from "@/features/finance/utils/finance-export";
import {
  buildFinanceReport,
  formatMonthLabel,
  getAvailableReportMonths,
} from "@/features/finance/utils/finance-report";
import { cn, formatRupiah } from "@/lib/utils";

/** Halaman 05 / Keuangan: rekap pemasukan booking (DP_PAID & PAID), filter periode, serta export Excel & PDF. */
export function AdminFinancePage() {
  const { bookings } = useAdminBookings();
  const { profile } = useBusinessProfile();
  const [monthFilter, setMonthFilter] = useState<string>("ALL");

  const availableMonths = useMemo(
    () => getAvailableReportMonths(bookings),
    [bookings]
  );

  const report = useMemo(
    () => buildFinanceReport(bookings, monthFilter),
    [bookings, monthFilter]
  );

  return (
    <div className="space-y-6">
      {/* Header + Period Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
            Keuangan
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Rekap Pemasukan Booking.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter Periode"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-10 rounded-lg border border-hairline bg-carbon px-3 font-mono text-xs text-white focus:border-gold focus:outline-none"
          >
            <option value="ALL">Semua Periode</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            disabled={report.rows.length === 0}
            onClick={() => exportFinanceToExcel(report, monthFilter, profile)}
            className="h-10 gap-2 border-emerald-400/35 bg-carbon font-mono text-xs text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200 disabled:opacity-45"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            Export Excel
          </Button>

          <Button
            type="button"
            disabled={report.rows.length === 0}
            onClick={() => void exportFinanceToPdf(report, monthFilter, profile)}
            className="h-10 gap-2 bg-gold font-mono text-xs font-bold tracking-wider text-obsidian uppercase hover:bg-gold-light disabled:opacity-45"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-gold/30 bg-carbon py-0 text-white">
          <CardContent className="p-5">
            <p className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
              Total Uang Masuk
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-gold tabular-nums">
              {formatRupiah(report.totalPaid)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-hairline bg-carbon py-0 text-white">
          <CardContent className="p-5">
            <p className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
              Sisa Tagihan DP
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-amber-300 tabular-nums">
              {formatRupiah(report.totalRemaining)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-hairline bg-carbon py-0 text-white">
          <CardContent className="p-5">
            <p className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
              Transaksi Masuk
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
              {report.rows.length}{" "}
              <span className="text-xs font-normal text-brand-muted">
                ({report.paidCount} Lunas • {report.dpCount} DP)
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      {report.rows.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-carbon p-10 text-center">
          <Wallet
            className="mx-auto h-8 w-8 text-brand-muted"
            aria-hidden="true"
          />
          <p className="mt-3 font-display text-base font-bold text-white">
            Belum ada pemasukan tercatat
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Booking dengan status pembayaran DP Masuk atau Lunas akan tampil di
            sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline bg-carbon">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-center font-mono text-[10px] tracking-wider text-brand-muted uppercase">
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Unit &amp; Jadwal</th>
                <th className="px-4 py-3">Skema</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Masuk</th>
                <th className="px-4 py-3">Sisa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/70">
              {report.rows.map((row) => (
                <tr key={row.id} className="hover:bg-obsidian/45">
                  <td className="px-4 py-3 font-mono font-bold text-gold">
                    {row.bookingCode}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {row.customerName}
                  </td>
                  <td className="px-4 py-3 text-brand-muted">
                    <span className="text-white">{row.carName}</span>
                    <br />
                    <span className="font-mono text-[10px]">
                      {row.scheduleLabel} ({row.totalDays} hari)
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                    {row.paymentSchemeLabel}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase",
                        row.paymentStatus === "PAID"
                          ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                          : "border-amber-400/40 bg-amber-400/15 text-amber-300"
                      )}
                    >
                      {row.paymentStatusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                    {formatRupiah(row.finalPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white tabular-nums">
                    {formatRupiah(row.paidAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    <span
                      className={
                        row.remainingAmount > 0
                          ? "font-bold text-amber-300"
                          : "text-brand-muted"
                      }
                    >
                      {formatRupiah(row.remainingAmount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-hairline bg-obsidian/60 font-mono text-xs font-bold">
                <td colSpan={5} className="px-4 py-3 text-right text-brand-muted uppercase">
                  Total Periode
                </td>
                <td className="px-4 py-3 text-right text-white tabular-nums">
                  {formatRupiah(report.totalFinalPrice)}
                </td>
                <td className="px-4 py-3 text-right text-gold tabular-nums">
                  {formatRupiah(report.totalPaid)}
                </td>
                <td className="px-4 py-3 text-right text-amber-300 tabular-nums">
                  {formatRupiah(report.totalRemaining)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
