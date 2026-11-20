import type { BookingItem, BookingStatus } from "../types/booking.types";

const VISIBLE_CALENDAR_STATUSES = new Set<BookingStatus>([
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
]);

export interface CalendarBoardCell {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  bookings: BookingItem[];
}

function formatYyyymmdd(year: number, monthIndex: number, day: number): string {
  const date = new Date(year, monthIndex, day);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildCalendarBoardCells(
  year: number,
  monthIndex: number,
  bookings: BookingItem[],
  carFilter: string = "ALL"
): CalendarBoardCell[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalSlots = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const relevantBookings = bookings.filter((item) => {
    if (!VISIBLE_CALENDAR_STATUSES.has(item.status)) return false;
    if (carFilter !== "ALL" && item.carId !== carFilter) return false;
    return true;
  });

  const cells: CalendarBoardCell[] = [];
  for (let slot = 0; slot < totalSlots; slot += 1) {
    const dayOffset = slot - firstWeekday + 1;
    const cellDate = new Date(year, monthIndex, dayOffset);
    const dateStr = formatYyyymmdd(year, monthIndex, dayOffset);
    const isCurrentMonth =
      cellDate.getFullYear() === year && cellDate.getMonth() === monthIndex;

    const dayBookings = relevantBookings.filter(
      (b) => b.startDate <= dateStr && b.endDate >= dateStr
    );

    cells.push({
      dateStr,
      dayNumber: cellDate.getDate(),
      isCurrentMonth,
      bookings: dayBookings,
    });
  }

  return cells;
}

