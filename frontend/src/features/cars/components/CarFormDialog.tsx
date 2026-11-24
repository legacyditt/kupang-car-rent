import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ImagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CarItem,
  CarStatus,
  CarTransmission,
} from "../types/car.types";
import {
  CAR_STATUS_LABELS,
  CAR_TRANSMISSION_LABELS,
  type CarFormPayload,
} from "../utils/car-admin";
import {
  MIN_IMAGE_HEIGHT,
  MIN_IMAGE_WIDTH,
  normalizeCarImageFile,
  TARGET_CANVAS_HEIGHT,
  TARGET_CANVAS_WIDTH,
} from "../utils/car-image";

interface CarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCar: CarItem | null;
  onSave: (payload: CarFormPayload) => void;
}

const STATUS_VALUES: CarStatus[] = [
  "AVAILABLE",
  "RENTED",
  "MAINTENANCE",
  "INACTIVE",
];

const TRANSMISSION_VALUES: CarTransmission[] = ["MATIC", "MANUAL", "BOTH"];

export function CarFormDialog({
  open,
  onOpenChange,
  editingCar,
  onSave,
}: CarFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [transmission, setTransmission] = useState<CarTransmission>("BOTH");
  const [capacityLabel, setCapacityLabel] = useState("7 Kursi");
  const [pricePerDay, setPricePerDay] = useState("300000");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMeta, setImageMeta] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [status, setStatus] = useState<CarStatus>("AVAILABLE");

  useEffect(() => {
    if (!open) return;
    setImageError(null);
    setImageMeta(null);
    if (editingCar) {
      setName(editingCar.name);
      setTransmission(editingCar.transmission ?? "BOTH");
      setCapacityLabel(editingCar.capacityLabel);
      setPricePerDay(String(editingCar.pricePerDay));
      setImageUrl(editingCar.imageUrl);
      setStatus(editingCar.status);
    } else {
      setName("");
      setTransmission("BOTH");
      setCapacityLabel("7 Kursi");
      setPricePerDay("300000");
      setImageUrl("");
      setStatus("AVAILABLE");
    }
  }, [open, editingCar]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImageError(null);
    setIsProcessingImage(true);
    try {
      const normalized = await normalizeCarImageFile(file);
      setImageUrl(normalized.dataUrl);
      setImageMeta(
        `${normalized.originalWidth}×${normalized.originalHeight} → ${normalized.outputWidth}×${normalized.outputHeight} px`,
      );
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Gagal memproses foto unit.",
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setImageError("Upload foto unit terlebih dahulu.");
      return;
    }

    const parsedPrice = Math.max(50000, Number(pricePerDay) || 300000);

    onSave({
      id: editingCar?.id,
      name,
      transmission,
      capacityLabel,
      pricePerDay: parsedPrice,
      imageUrl,
      status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-gold/25 bg-carbon text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-white">
            {editingCar ? `Edit ${editingCar.name}` : "Tambah Unit Kendaraan"}
          </DialogTitle>
          <DialogDescription className="text-xs text-brand-muted">
            Perbarui informasi unit, tarif harian, dan foto standar showroom.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="car-name"
              className="font-mono text-[11px] tracking-wider text-brand-muted uppercase"
            >
              Nama Kendaraan
            </Label>
            <Input
              id="car-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Toyota Avanza"
              className="border-hairline bg-obsidian text-white focus-visible:border-gold focus-visible:ring-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-mono text-[11px] tracking-wider text-brand-muted uppercase">
                Transmisi
              </Label>
              <Select
                value={transmission}
                onValueChange={(val) => setTransmission(val as CarTransmission)}
              >
                <SelectTrigger className="w-full border-hairline bg-obsidian font-mono text-xs text-white focus:border-gold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-hairline bg-carbon text-white">
                  {TRANSMISSION_VALUES.map((val) => (
                    <SelectItem
                      key={val}
                      value={val}
                      className="font-mono text-xs focus:bg-obsidian focus:text-gold"
                    >
                      {CAR_TRANSMISSION_LABELS[val]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="car-capacity"
                className="font-mono text-[11px] tracking-wider text-brand-muted uppercase"
              >
                Kapasitas
              </Label>
              <Input
                id="car-capacity"
                value={capacityLabel}
                onChange={(e) => setCapacityLabel(e.target.value)}
                placeholder="7 Kursi"
                className="border-hairline bg-obsidian text-white focus-visible:border-gold focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="car-price"
                className="font-mono text-[11px] tracking-wider text-brand-muted uppercase"
              >
                Harga / Hari (Rp)
              </Label>
              <Input
                id="car-price"
                type="number"
                min={50000}
                step={25000}
                required
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                className="border-hairline bg-obsidian font-mono text-gold focus-visible:border-gold focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-[11px] tracking-wider text-brand-muted uppercase">
                Status Unit
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as CarStatus)}
              >
                <SelectTrigger className="w-full border-hairline bg-obsidian font-mono text-xs text-white focus:border-gold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-hairline bg-carbon text-white">
                  {STATUS_VALUES.map((val) => (
                    <SelectItem
                      key={val}
                      value={val}
                      className="font-mono text-xs focus:bg-obsidian focus:text-gold"
                    >
                      {CAR_STATUS_LABELS[val]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-[11px] tracking-wider text-brand-muted uppercase">
                Foto Unit
              </Label>
              {imageMeta && (
                <span className="font-mono text-[10px] text-emerald-400">
                  {imageMeta}
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              id="car-photo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
            />

            {imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-hairline bg-obsidian">
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-white p-2">
                  <img
                    src={imageUrl}
                    alt={name || "Preview unit"}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-hairline px-3 py-2">
                  <span className="font-mono text-[10px] text-brand-muted">
                    Standar {TARGET_CANVAS_WIDTH}×{TARGET_CANVAS_HEIGHT} (16:10)
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 border-gold/30 bg-carbon font-mono text-[10px] text-gold hover:border-gold hover:text-gold"
                  >
                    <Upload className="h-3 w-3" aria-hidden="true" />
                    {isProcessingImage ? "Memproses..." : "Ganti Foto"}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={isProcessingImage}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/35 bg-obsidian px-4 py-6 text-center transition-colors hover:border-gold hover:bg-obsidian/80"
              >
                <ImagePlus className="h-6 w-6 text-gold" aria-hidden="true" />
                <span className="font-display text-xs font-bold text-white">
                  {isProcessingImage
                    ? "Menyesuaikan ukuran foto..."
                    : "Pilih atau Upload Foto Mobil"}
                </span>
                <span className="font-mono text-[10px] text-brand-muted">
                  JPG, PNG, WEBP • Maks 5 MB • Min {MIN_IMAGE_WIDTH}×
                  {MIN_IMAGE_HEIGHT} px
                </span>
              </button>
            )}
            {imageError && (
              <p className="font-mono text-xs font-medium text-red-400">
                {imageError}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-hairline bg-obsidian font-mono text-xs text-brand-muted hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={isProcessingImage}
              className="font-display text-xs tracking-wider uppercase"
            >
              {editingCar ? "Simpan Perubahan" : "Tambah Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
