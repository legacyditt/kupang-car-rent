import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "../types/booking.types";
import { BOOKING_STATUS_LABELS } from "../utils/booking-admin";

const STATUS_BADGE_MAP: Record<BookingStatus, string> = {
  PENDING: "border-gold/40 bg-gold/15 text-gold",
  CONFIRMED: "border-emerald-400/40 bg-emerald-400/15 text-emerald-400",
  IN_PROGRESS: "border-sky-400/40 bg-sky-400/15 text-sky-400",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  REJECTED: "border-red-400/40 bg-red-400/15 text-red-400",
  CANCELLED: "border-hairline bg-obsidian text-brand-muted",
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function BookingStatusBadge({
  status,
  className,
}: BookingStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-md border font-mono text-[10px] font-bold uppercase",
        STATUS_BADGE_MAP[status],
        className
      )}
    >
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}
