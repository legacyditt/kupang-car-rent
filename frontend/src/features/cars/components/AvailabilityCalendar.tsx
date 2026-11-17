import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY_HEADERS, MONTH_NAMES, toTimestamp } from "../utils/booking";

interface AvailabilityCalendarProps {
  viewDate: Date;
  calendarCells: Array<string | null>;
  todayIso: string;
  bookedSet: Set<string>;
  startDate: string | null;
  endDate: string | null;
  onSelectDate: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function AvailabilityCalendar({
  viewDate,
  calendarCells,
  todayIso,
  bookedSet,
  startDate,
  endDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: AvailabilityCalendarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-text">
          Pilih Tanggal Mulai & Selesai
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="rounded p-1 hover:bg-slate-100"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[110px] text-center text-xs font-semibold">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded p-1 hover:bg-slate-100"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-brand-muted">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((iso, idx) => {
          if (!iso) return <div key={`empty-${idx}`} />;

          const cellTime = toTimestamp(iso);
          const todayTime = toTimestamp(todayIso);
          const startTime = startDate ? toTimestamp(startDate) : null;
          const endTime = endDate ? toTimestamp(endDate) : null;
          const isPast = cellTime < todayTime;
          const isBooked = bookedSet.has(iso);
          const isDisabled = isPast || isBooked;
          const isEdge = iso === startDate || iso === endDate;
          const isInRange = Boolean(
            startTime && endTime && cellTime > startTime && cellTime < endTime,
          );

          return (
            <button
              key={iso}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(iso)}
              className={cn(
                "h-8 rounded-md text-xs font-medium transition-colors",
                isDisabled &&
                  "cursor-not-allowed bg-slate-100 text-slate-400 line-through",
                !isDisabled &&
                  !isEdge &&
                  !isInRange &&
                  "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                isInRange && "bg-brand-navy/15 text-brand-navy",
                isEdge && "bg-brand-navy font-bold text-white",
              )}
            >
              {Number(iso.slice(0, 2))}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-4 text-[11px] text-brand-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-emerald-300 bg-emerald-100" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-200" />
          Tidak Tersedia
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-navy" />
          Dipilih
        </span>
      </div>
    </div>
  );
}
