import { cn } from "@/lib/utils";

interface CalendarGuideProps {
  startDate: string | null;
  endDate: string | null;
}

const MINI_CELL = "h-4 w-4 rounded-[3px] border";
const MINI_EDGE = "border-gold bg-gold";
const MINI_RANGE = "border-gold/30 bg-gold/15";

function getPrompt(startDate: string | null, endDate: string | null) {
  if (!startDate) return "Mulai: klik tanggal pengambilan.";
  if (!endDate) return "Lanjut: klik tanggal selesai, atau klik tanggal yang sama untuk 1 hari.";
  return "Klik tanggal lain untuk mengulang pilihan.";
}

export function CalendarGuide({ startDate, endDate }: CalendarGuideProps) {
  const isComplete = Boolean(startDate && endDate);

  return (
    <div className="mb-3 rounded-lg border border-hairline bg-obsidian/60 p-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="flex items-center gap-1">
            <span className={cn(MINI_CELL, MINI_EDGE)} />
          </div>
          <p className="text-[11px] leading-tight text-brand-muted">
            <span className="block font-semibold text-white">1 hari</span>
            Klik tanggal yang sama 2×
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="flex items-center gap-0.5">
            <span className={cn(MINI_CELL, MINI_EDGE)} />
            <span className={cn(MINI_CELL, MINI_RANGE)} />
            <span className={cn(MINI_CELL, MINI_EDGE)} />
          </div>
          <p className="text-[11px] leading-tight text-brand-muted">
            <span className="block font-semibold text-white">Lebih dari 1 hari</span>
            Klik awal, lalu akhir
          </p>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          "mt-2.5 border-t border-hairline pt-2.5 font-mono text-[11px] leading-snug",
          isComplete ? "text-brand-muted" : "text-gold"
        )}
      >
        {getPrompt(startDate, endDate)}
      </p>
    </div>
  );
}
