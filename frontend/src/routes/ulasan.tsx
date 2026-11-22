import { CheckCircle2, Star } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readStoredBookings } from "@/features/bookings/utils/bookings-storage";
import { useBusinessProfile } from "@/features/business-profile/hooks/useBusinessProfile";
import { SERVICE_TYPE_LABELS } from "@/features/cars/utils/booking";
import { useTestimonials } from "@/features/testimonials/hooks/useTestimonials";
import { cn } from "@/lib/utils";

/** Halaman independen pengisian testimoni pelanggan setelah penyewaan selesai (COMPLETED). */
export function CustomerReviewPage() {
  const { testimonials, submitPublic } = useTestimonials();
  const { profile } = useBusinessProfile();

  const bookingCode = useMemo(() => {
    try {
      return (
        new URLSearchParams(window.location.search)
          .get("kode")
          ?.trim()
          .toUpperCase() ?? ""
      );
    } catch {
      return "";
    }
  }, []);

  const matchedBooking = useMemo(
    () =>
      readStoredBookings().find(
        (b) => b.bookingCode.toUpperCase() === bookingCode
      ) ?? null,
    [bookingCode]
  );

  const alreadySubmitted = useMemo(
    () =>
      Boolean(
        bookingCode &&
          testimonials.some(
            (t) => t.bookingCode?.toUpperCase() === bookingCode
          )
      ),
    [bookingCode, testimonials]
  );

  const [customerName, setCustomerName] = useState(
    matchedBooking?.customerName ?? ""
  );
  const [rating, setRating] = useState(1);
  const [quote, setQuote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const isEligible =
    Boolean(matchedBooking) &&
    matchedBooking?.status === "COMPLETED" &&
    !alreadySubmitted;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!matchedBooking) return;

    const tripLabel = SERVICE_TYPE_LABELS[matchedBooking.serviceType];
    const res = submitPublic({
      bookingCode: matchedBooking.bookingCode,
      customerName,
      rating,
      tripLabel,
      quote,
    });
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    setSubmittedName(res.item.customerName);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-obsidian px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-carbon p-7 shadow-2xl sm:p-8">
        {/* Brand Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 items-center justify-center rounded-lg border border-gold/30 bg-obsidian px-2.5 py-1">
            <img
              src={profile.logoPath}
              alt={profile.name}
              className="h-6 w-auto object-contain"
            />
          </div>
          <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-gold uppercase">
            Ulasan Pelanggan
          </p>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Bagikan Pengalaman Sewa Anda.
        </h1>

        {submittedName ? (
          <div className="mt-6 rounded-xl border border-emerald-400/35 bg-emerald-400/10 p-5 text-center">
            <CheckCircle2
              className="mx-auto h-8 w-8 text-emerald-400"
              aria-hidden="true"
            />
            <p className="mt-3 font-display text-base font-bold text-white">
              Terima kasih, {submittedName}!
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              Ulasan Anda telah diterima dan menunggu peninjauan admin untuk
              ditampilkan.
            </p>
          </div>
        ) : !isEligible ? (
          <div className="mt-6 rounded-xl border border-amber-400/35 bg-amber-400/10 p-4 text-xs leading-relaxed text-amber-200">
            {alreadySubmitted
              ? "Ulasan untuk penyewaan ini sudah pernah dikirim. Terima kasih atas masukan Anda."
              : "Link ulasan tidak valid atau penyewaan belum berstatus Selesai."}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="customer-name"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Nama
              </Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Anda"
                required
                className="border-hairline bg-obsidian text-white placeholder:text-brand-muted/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="car-unit"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Unit
              </Label>
              <Input
                id="car-unit"
                value={matchedBooking?.carName ?? ""}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                className="pointer-events-none select-none border-hairline bg-obsidian/60 font-medium text-gold focus-visible:border-hairline focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
                Rating Layanan
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} bintang`}
                    className="cursor-pointer rounded-md p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        star <= rating
                          ? "fill-gold text-gold"
                          : "text-brand-muted/40"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="review-quote"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Ulasan Anda
              </Label>
              <textarea
                id="review-quote"
                required
                rows={4}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Ceritakan pengalaman anda mengenai pelayanan kami..."
                className="w-full rounded-lg border border-hairline bg-obsidian p-3 text-sm text-white placeholder:text-brand-muted/50 focus:border-gold focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/35 bg-red-400/10 p-2.5 font-mono text-xs text-red-300"
              >
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full cursor-pointer bg-gold font-mono text-xs font-bold tracking-wider text-obsidian uppercase hover:bg-gold-light"
            >
              Kirim Testimoni →
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
