import { CheckCircle2, Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTestimonials } from "@/features/testimonials/hooks/useTestimonials";
import { cn } from "@/lib/utils";

/** Halaman publik pengisian testimoni pelanggan setelah penyewaan selesai (COMPLETED). */
export function CustomerReviewPage() {
  const { submitPublic } = useTestimonials();
  const initialCode = (() => {
    try {
      return new URLSearchParams(window.location.search).get("kode") ?? "";
    } catch {
      return "";
    }
  })();

  const [bookingCode, setBookingCode] = useState(initialCode);
  const [rating, setRating] = useState(5);
  const [tripLabel, setTripLabel] = useState("");
  const [quote, setQuote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const res = submitPublic({
      bookingCode,
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
    <section className="mx-auto max-w-lg px-5 py-16 sm:py-24">
      <div className="rounded-2xl border border-gold/25 bg-carbon p-7 text-white shadow-2xl sm:p-8">
        <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
          Ulasan Pelanggan
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
          Bagikan Pengalaman Sewa Anda.
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">
          Masukkan kode booking yang sudah selesai untuk mengirimkan testimoni
          Anda.
        </p>

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
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="review-booking-code"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Kode Booking
              </Label>
              <Input
                id="review-booking-code"
                required
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                placeholder="BK-20261110-D004"
                className="h-10 border-hairline bg-obsidian font-mono text-sm text-gold placeholder:text-brand-muted/50 focus-visible:border-gold focus-visible:ring-0"
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
                htmlFor="review-trip"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Keperluan Perjalanan (Opsional)
              </Label>
              <Input
                id="review-trip"
                value={tripLabel}
                onChange={(e) => setTripLabel(e.target.value)}
                placeholder="Contoh: Perjalanan Dinas / Wisata Keluarga"
                className="h-10 border-hairline bg-obsidian text-sm text-white placeholder:text-brand-muted/50 focus-visible:border-gold focus-visible:ring-0"
              />
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
                placeholder="Ceritakan kondisi unit dan pelayanan kami..."
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
              className="h-11 w-full bg-gold font-mono text-xs font-bold tracking-wider text-obsidian uppercase hover:bg-gold-light"
            >
              Kirim Testimoni →
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
