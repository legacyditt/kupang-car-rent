import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTestimonials } from "@/features/testimonials/hooks/useTestimonials";
import type {
  TestimonialItem,
  TestimonialStatus,
} from "@/features/testimonials/types/testimonial.types";
import { TESTIMONIAL_STATUS_LABELS } from "@/features/testimonials/utils/testimonials";
import { cn } from "@/lib/utils";

type FilterTab = "ALL" | TestimonialStatus;

/** Halaman 06 / Testimoni: moderasi ulasan pelanggan (PENDING/PUBLISHED/HIDDEN) dan CRUD manual. */
export function AdminTestimonialsPage() {
  const {
    testimonials,
    changeStatus,
    saveTestimonial,
    removeTestimonial,
  } = useTestimonials();

  const [tab, setTab] = useState<FilterTab>("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [carName, setCarName] = useState("");
  const [tripLabel, setTripLabel] = useState("");
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [status, setStatus] = useState<TestimonialStatus>("PUBLISHED");

  const filtered = useMemo(
    () =>
      tab === "ALL"
        ? testimonials
        : testimonials.filter((t) => t.status === tab),
    [testimonials, tab]
  );

  function openNewDialog() {
    setEditingItem(null);
    setCustomerName("");
    setCarName("");
    setTripLabel("");
    setRating(5);
    setQuote("");
    setStatus("PUBLISHED");
    setIsDialogOpen(true);
  }

  function openEditDialog(item: TestimonialItem) {
    setEditingItem(item);
    setCustomerName(item.customerName);
    setCarName(item.carName);
    setTripLabel(item.tripLabel);
    setRating(item.rating);
    setQuote(item.quote);
    setStatus(item.status);
    setIsDialogOpen(true);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!customerName.trim() || !quote.trim()) return;
    saveTestimonial({
      id: editingItem?.id,
      customerName,
      carName,
      tripLabel,
      rating,
      quote,
      status,
    });
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
            06 / Testimoni Pelanggan
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Moderasi &amp; Kurasi Ulasan.
          </h1>
        </div>

        <Button
          type="button"
          onClick={openNewDialog}
          className="h-10 gap-2 self-start bg-gold font-mono text-xs font-bold tracking-wider text-obsidian uppercase hover:bg-gold-light sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Testimoni
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "PUBLISHED", "HIDDEN"] as const).map((t) => {
          const count =
            t === "ALL"
              ? testimonials.length
              : testimonials.filter((item) => item.status === t).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg border px-3 py-1.5 font-mono text-[11px] font-medium uppercase transition-colors",
                tab === t
                  ? "border-gold/50 bg-gold/15 font-bold text-gold"
                  : "border-hairline bg-carbon text-brand-muted hover:text-white"
              )}
            >
              {t === "ALL" ? "Semua" : TESTIMONIAL_STATUS_LABELS[t]} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className="rounded-2xl border-hairline bg-carbon py-0 text-white"
          >
            <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-bold text-white">
                      {item.customerName}
                    </p>
                    <p className="font-mono text-[11px] text-brand-muted">
                      {item.carName} • {item.tripLabel}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase",
                      item.status === "PUBLISHED" &&
                        "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
                      item.status === "PENDING" &&
                        "border-gold/40 bg-gold/15 text-gold",
                      item.status === "HIDDEN" &&
                        "border-hairline bg-obsidian text-brand-muted"
                    )}
                  >
                    {TESTIMONIAL_STATUS_LABELS[item.status]}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={cn(
                        "h-3.5 w-3.5",
                        idx < item.rating
                          ? "fill-gold text-gold"
                          : "text-brand-muted/30"
                      )}
                    />
                  ))}
                  {item.bookingCode && (
                    <span className="ml-2 font-mono text-[10px] text-gold">
                      {item.bookingCode}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  “{item.quote}”
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
                {item.status !== "PUBLISHED" ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => changeStatus(item.id, "PUBLISHED")}
                    className="h-8 gap-1.5 bg-emerald-500 font-mono text-[10px] font-bold text-obsidian uppercase hover:bg-emerald-400"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    Tampilkan
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => changeStatus(item.id, "HIDDEN")}
                    className="h-8 gap-1.5 border-hairline bg-obsidian font-mono text-[10px] text-brand-muted hover:text-white"
                  >
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                    Sembunyikan
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(item)}
                  className="h-8 gap-1 border-hairline bg-obsidian font-mono text-[10px] text-brand-muted hover:text-white"
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  Edit
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeTestimonial(item.id)}
                  className="ml-auto h-8 gap-1 border-red-400/30 bg-red-400/10 font-mono text-[10px] text-red-300 hover:bg-red-400/20"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-gold/25 bg-carbon text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-white">
              {editingItem ? "Edit Testimoni" : "Tambah Testimoni"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="font-mono text-[10px] text-brand-muted uppercase">
                Nama Pelanggan
              </Label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama pelanggan"
                className="h-9 border-hairline bg-obsidian text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="font-mono text-[10px] text-brand-muted uppercase">
                  Unit
                </Label>
                <Input
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  placeholder="Toyota Avanza"
                  className="h-9 border-hairline bg-obsidian text-sm text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-[10px] text-brand-muted uppercase">
                  Keperluan
                </Label>
                <Input
                  value={tripLabel}
                  onChange={(e) => setTripLabel(e.target.value)}
                  placeholder="Perjalanan Dinas"
                  className="h-9 border-hairline bg-obsidian text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="font-mono text-[10px] text-brand-muted uppercase">
                  Rating (1–5)
                </Label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="h-9 w-full rounded-md border border-hairline bg-obsidian px-2 text-sm text-white"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Bintang
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-[10px] text-brand-muted uppercase">
                  Status
                </Label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as TestimonialStatus)
                  }
                  className="h-9 w-full rounded-md border border-hairline bg-obsidian px-2 text-sm text-white"
                >
                  <option value="PUBLISHED">Ditampilkan</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="HIDDEN">Disembunyikan</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-mono text-[10px] text-brand-muted uppercase">
                Ulasan
              </Label>
              <textarea
                required
                rows={3}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full rounded-lg border border-hairline bg-obsidian p-2.5 text-sm text-white focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-9 border-hairline bg-obsidian font-mono text-xs text-brand-muted"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-9 bg-gold font-mono text-xs font-bold text-obsidian uppercase hover:bg-gold-light"
              >
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

