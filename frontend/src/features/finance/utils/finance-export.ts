import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { BusinessProfile } from "@/features/business-profile/types/business-profile.types";
import { formatRupiah } from "@/lib/utils";
import { formatMonthLabel, type FinanceReport } from "./finance-report";

/**
 * Mengekspor rekap keuangan ke file Excel (.xlsx) asli dengan header ringkasan dan tabel transaksi.
 */
export function exportFinanceToExcel(
  report: FinanceReport,
  monthFilter: string,
  profile: BusinessProfile
): void {
  const periodLabel = formatMonthLabel(monthFilter);
  const summaryRows = [
    ["LAPORAN KEUANGAN RENTAL", profile.name],
    ["Lokasi", profile.location],
    ["Periode", periodLabel],
    ["Total Uang Masuk", report.totalPaid],
    ["Sisa Tagihan DP", report.totalRemaining],
    ["Jumlah Transaksi", report.rows.length],
    [],
    [
      "Kode Booking",
      "Pelanggan",
      "Unit",
      "Jadwal",
      "Durasi (Hari)",
      "Skema",
      "Status Bayar",
      "Harga Final (Rp)",
      "Uang Masuk (Rp)",
      "Sisa Tagihan (Rp)",
    ],
    ...report.rows.map((r) => [
      r.bookingCode,
      r.customerName,
      r.carName,
      r.scheduleLabel,
      r.totalDays,
      r.paymentSchemeLabel,
      r.paymentStatusLabel,
      r.finalPrice,
      r.paidAmount,
      r.remainingAmount,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(summaryRows);
  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 26 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");

  const slugPeriod = monthFilter === "ALL" ? "semua-periode" : monthFilter;
  XLSX.writeFile(workbook, `laporan-keuangan-${slugPeriod}.xlsx`);
}

/**
 * Mengekspor rekap keuangan ke file PDF (.pdf) siap unduh untuk arsip pemilik rental.
 */
export function exportFinanceToPdf(
  report: FinanceReport,
  monthFilter: string,
  profile: BusinessProfile
): void {
  const periodLabel = formatMonthLabel(monthFilter);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(15);
  doc.text(`${profile.name} — Laporan Keuangan`, 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Periode: ${periodLabel}  |  ${profile.location}`, 14, 22);
  doc.text(
    `Total Uang Masuk: ${formatRupiah(report.totalPaid)}   |   Sisa Tagihan DP: ${formatRupiah(report.totalRemaining)}   |   Transaksi: ${report.rows.length}`,
    14,
    28
  );

  autoTable(doc, {
    startY: 34,
    head: [
      [
        "Kode",
        "Pelanggan",
        "Unit",
        "Jadwal",
        "Skema",
        "Status",
        "Masuk",
        "Sisa",
      ],
    ],
    body: report.rows.map((r) => [
      r.bookingCode,
      r.customerName,
      r.carName,
      `${r.scheduleLabel} (${r.totalDays}h)`,
      r.paymentSchemeLabel,
      r.paymentStatusLabel,
      formatRupiah(r.paidAmount),
      formatRupiah(r.remainingAmount),
    ]),
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [18, 22, 30], textColor: [245, 184, 46] },
  });

  const slugPeriod = monthFilter === "ALL" ? "semua-periode" : monthFilter;
  doc.save(`laporan-keuangan-${slugPeriod}.pdf`);
}
