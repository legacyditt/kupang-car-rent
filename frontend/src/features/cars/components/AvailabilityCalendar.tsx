import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DAY_HEADERS, MONTH_NAMES, toTimestamp } from "../utils/booking";
import { CalendarGuide } from "./CalendarGuide";

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
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium tracking-wider text-brand-muted uppercase">
          Pilih Tanggal
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onPrevMonth}
            className="h-7 w-7 rounded-md border-hairline bg-obsidian text-brand-muted hover:border-gold/40 hover:bg-obsidian hover:text-gold"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[110px] text-center font-display text-xs font-bold text-white">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="h-7 w-7 rounded-md border-hairline bg-obsidian text-brand-muted hover:border-gold/40 hover:bg-obsidian hover:text-gold"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <CalendarGuide startDate={startDate} endDate={endDate} />

      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-medium text-brand-muted uppercase">
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
            startTime && endTime && cellTime > startTime && cellTime < endTime
          );

          return (
            <button
              key={iso}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(iso)}
              className={cn(
                "h-9 rounded-md font-mono text-xs font-medium transition-colors",
                isDisabled &&
                  "cursor-not-allowed bg-obsidian/50 text-slate-600 line-through",
                !isDisabled &&
                  !isEdge &&
                  !isInRange &&
                  "border border-hairline bg-obsidian text-slate-200 hover:border-gold/50 hover:text-gold",
                isInRange && "border border-gold/30 bg-gold/15 text-gold-light",
                isEdge &&
                  "border border-gold bg-gold font-bold text-obsidian shadow-[0_0_12px_rgba(245,184,46,0.25)]"
              )}
            >
              {Number(iso.slice(0, 2))}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 font-mono text-[10px] text-brand-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-hairline bg-obsidian" />
          Tersedia
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-obsidian/50 line-through ring-1 ring-hairline/50" />
          Penuh
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gold" />
          Dipilih
        </span>
      </div>
    </div>
  );
}
