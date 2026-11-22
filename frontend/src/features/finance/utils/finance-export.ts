import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import XLSX from "xlsx-js-style";
import type { BusinessProfile } from "@/features/business-profile/types/business-profile.types";
import { formatRupiah } from "@/lib/utils";
import { formatMonthLabel, type FinanceReport } from "./finance-report";

const THIN_BORDER = {
  top: { style: "thin", color: { rgb: "CBD5E1" } },
  bottom: { style: "thin", color: { rgb: "CBD5E1" } },
  left: { style: "thin", color: { rgb: "CBD5E1" } },
  right: { style: "thin", color: { rgb: "CBD5E1" } },
} as const;

/** Mengubah path/DataURL logo menjadi PNG DataURL agar aman disematkan ke jsPDF. */
async function loadLogoDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 240;
        canvas.height = img.naturalHeight || 80;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Mengekspor rekap keuangan ke file Excel (.xlsx) berbentuk tabel rapi dengan border, warna header, dan total.
 */
export function exportFinanceToExcel(
  report: FinanceReport,
  monthFilter: string,
  profile: BusinessProfile
): void {
  const periodLabel = formatMonthLabel(monthFilter);
  const aoa: Array<Array<string | number>> = [
    [`LAPORAN KEUANGAN — ${profile.name.toUpperCase()}`],
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
      "Total (Rp)",
      "Masuk (Rp)",
      "Sisa (Rp)",
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
    [
      "TOTAL PERIODE",
      "",
      "",
      "",
      report.rows.reduce((sum, r) => sum + r.totalDays, 0),
      "",
      "",
      report.totalFinalPrice,
      report.totalPaid,
      report.totalRemaining,
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const headerRowIdx = 7; // 0-based row 8
  const firstDataRowIdx = 8;
  const totalRowIdx = firstDataRowIdx + report.rows.length;

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: totalRowIdx, c: 0 }, e: { r: totalRowIdx, c: 3 } },
  ];

  ws["!cols"] = [
    { wch: 19 },
    { wch: 18 },
    { wch: 21 },
    { wch: 27 },
    { wch: 13 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ];
  ws["!autofilter"] = { ref: `A8:J${totalRowIdx}` };

  // Title banner style
  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 14, color: { rgb: "F5B82E" } },
      fill: { fgColor: { rgb: "0C0E13" } },
      alignment: { horizontal: "left", vertical: "center" },
    };
  }

  // Summary block formatting
  for (let r = 1; r <= 5; r += 1) {
    const labelCell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
    const valCell = ws[XLSX.utils.encode_cell({ r, c: 1 })];
    if (labelCell) {
      labelCell.s = { font: { bold: true, sz: 10, color: { rgb: "475569" } } };
    }
    if (valCell) {
      valCell.s = {
        font: { bold: r === 3 || r === 4, sz: 10, color: { rgb: "0F172A" } },
        numFmt: r === 3 || r === 4 ? '"Rp "#,##0' : undefined,
        alignment: { horizontal: "left" },
      };
    }
  }

  // Table header styling
  for (let c = 0; c <= 9; c += 1) {
    const cell = ws[XLSX.utils.encode_cell({ r: headerRowIdx, c })];
    if (!cell) continue;
    cell.s = {
      font: { bold: true, sz: 10, color: { rgb: "F5B82E" } },
      fill: { fgColor: { rgb: "12161E" } },
      border: THIN_BORDER,
      alignment: {
        horizontal: c >= 7 ? "right" : c === 4 ? "center" : "left",
        vertical: "center",
      },
    };
  }

  // Table body styling (zebra + currency format)
  for (let r = firstDataRowIdx; r < totalRowIdx; r += 1) {
    const isEven = (r - firstDataRowIdx) % 2 === 1;
    for (let c = 0; c <= 9; c += 1) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (!cell) continue;
      cell.s = {
        font: { sz: 10, color: { rgb: "0F172A" } },
        fill: { fgColor: { rgb: isEven ? "F8FAFC" : "FFFFFF" } },
        border: THIN_BORDER,
        numFmt: c >= 7 ? '"Rp "#,##0' : undefined,
        alignment: {
          horizontal: c >= 7 ? "right" : c === 4 ? "center" : "left",
          vertical: "center",
        },
      };
    }
  }

  // Total row styling
  for (let c = 0; c <= 9; c += 1) {
    const cell = ws[XLSX.utils.encode_cell({ r: totalRowIdx, c })];
    if (!cell) continue;
    cell.s = {
      font: { bold: true, sz: 10, color: { rgb: "0F172A" } },
      fill: { fgColor: { rgb: "FEF3C7" } },
      border: THIN_BORDER,
      numFmt: c >= 7 ? '"Rp "#,##0' : undefined,
      alignment: {
        horizontal: c >= 7 ? "right" : c === 4 ? "center" : "left",
        vertical: "center",
      },
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws, "Laporan Keuangan");

  const slugPeriod = monthFilter === "ALL" ? "semua-periode" : monthFilter;
  XLSX.writeFile(workbook, `laporan-keuangan-${slugPeriod}.xlsx`);
}

/**
 * Mengekspor rekap keuangan ke file PDF (.pdf) dengan kop logo Aventra, KPI box, dan tabel rapi.
 */
export async function exportFinanceToPdf(
  report: FinanceReport,
  monthFilter: string,
  profile: BusinessProfile
): Promise<void> {
  const periodLabel = formatMonthLabel(monthFilter);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark header banner + gold accent bar
  doc.setFillColor(12, 14, 19);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setFillColor(245, 184, 46);
  doc.rect(0, 28, pageWidth, 1.2, "F");

  const logoDataUrl = await loadLogoDataUrl(profile.logoPath);
  let textStartX = 14;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 14, 5, 34, 18);
    textStartX = 53;
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`${profile.name} — Laporan Keuangan`, textStartX, 13);

  doc.setTextColor(180, 188, 200);
  doc.setFontSize(9);
  doc.text(
    `Periode: ${periodLabel}   |   ${profile.location}   |   WA: ${profile.whatsappDisplayIntl}`,
    textStartX,
    20
  );

  // KPI Summary Strip
  const kpiY = 34;
  const cardWidth = (pageWidth - 28 - 8) / 3;
  const kpis = [
    {
      label: "TOTAL UANG MASUK",
      value: formatRupiah(report.totalPaid),
      accent: [16, 185, 129] as const,
    },
    {
      label: "SISA TAGIHAN DP",
      value: formatRupiah(report.totalRemaining),
      accent: [217, 119, 6] as const,
    },
    {
      label: "TRANSAKSI MASUK",
      value: `${report.rows.length} Booking (${report.paidCount} Lunas, ${report.dpCount} DP)`,
      accent: [15, 23, 42] as const,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, kpiY, cardWidth, 16, 2, 2, "FD");

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 4, kpiY + 6);

    doc.setFontSize(11);
    doc.setTextColor(kpi.accent[0], kpi.accent[1], kpi.accent[2]);
    doc.text(kpi.value, x + 4, kpiY + 12.5);
  });

  autoTable(doc, {
    startY: 55,
    theme: "grid",
    head: [
      [
        "Kode",
        "Pelanggan",
        "Unit",
        "Jadwal",
        "Skema",
        "Status",
        "Total",
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
      formatRupiah(r.finalPrice),
      formatRupiah(r.paidAmount),
      formatRupiah(r.remainingAmount),
    ]),
    foot: [
      [
        {
          content: "TOTAL PERIODE",
          colSpan: 6,
          styles: { halign: "right", fontStyle: "bold" },
        },
        formatRupiah(report.totalFinalPrice),
        formatRupiah(report.totalPaid),
        formatRupiah(report.totalRemaining),
      ],
    ],
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [18, 22, 30],
      textColor: [245, 184, 46],
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: [254, 243, 199],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      6: { halign: "right" },
      7: { halign: "right" },
      8: { halign: "right" },
    },
  });

  const slugPeriod = monthFilter === "ALL" ? "semua-periode" : monthFilter;
  doc.save(`laporan-keuangan-${slugPeriod}.pdf`);
}
