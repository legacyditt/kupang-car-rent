import { formatRupiah } from "@/lib/utils";
import type { CarItem } from "../types/car.types";

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export const DAY_HEADERS = [
  "Min",
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
] as const;

/** Format Date ke "DD-MM-YYYY" pakai waktu lokal. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${d}-${m}-${y}`;
}

/** Parse "DD-MM-YYYY" ke Date lokal jam 00:00:00. */
export function parseISODate(dateStr: string): Date {
  const [d, m, y] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Ubah "DD-MM-YYYY" ke angka milidetik untuk perbandingan < / >. */
export function toTimestamp(dateStr: string): number {
  return parseISODate(dateStr).getTime();
}

/** Bangun array cell kalender 1 bulan (null = spacer awal minggu). */
export function getCalendarCells(
  year: number,
  month: number,
): Array<string | null> {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<string | null> = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(year, month, day)));
  }
  return cells;
}

/** Hitung jumlah hari inklusif antara start dan end. */
export function calculateRentalDays(startIso: string, endIso: string): number {
  const msPerDay = 86_400_000;
  const diff =
    parseISODate(endIso).getTime() - parseISODate(startIso).getTime();
  return Math.round(diff / msPerDay) + 1;
}

/** Cek apakah rentang [startIso..endIso] menabrak tanggal di bookedSet. */
export function hasBookedDateInRange(
  startIso: string,
  endIso: string,
  bookedSet: Set<string>,
): boolean {
  const cursor = parseISODate(startIso);
  const end = parseISODate(endIso);

  while (cursor <= end) {
    if (bookedSet.has(toISODate(cursor))) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

export type RentalServiceType = "SELF_DRIVE" | "WITH_DRIVER";

export const SERVICE_TYPE_LABELS: Record<RentalServiceType, string> = {
  SELF_DRIVE: "Lepas Kunci",
  WITH_DRIVER: "Dengan Sopir",
};

/** Susun format pesan WhatsApp untuk booking. */
export function buildBookingMessage(params: {
  car: CarItem;
  name: string;
  serviceType: RentalServiceType;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
}): string {
  const { car, name, serviceType, startDate, endDate, totalDays, totalPrice } =
    params;
  return [
    "Halo, saya ingin booking mobil:",
    `- Nama: ${name}`,
    `- Mobil: ${car.name}`,
    `- Layanan: ${SERVICE_TYPE_LABELS[serviceType]}`,
    `- Tanggal Mulai: ${startDate}`,
    `- Tanggal Selesai: ${endDate}`,
    `- Durasi: ${totalDays} hari`,
    `- Estimasi Total: ${formatRupiah(totalPrice)}`,
  ].join("\n");
}
