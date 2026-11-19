import { useEffect, useState, type FormEvent } from "react";
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
import type { CarItem, CarStatus } from "../types/car.types";
import type { CarFormPayload } from "../utils/car-admin";

interface CarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCar: CarItem | null;
  onSave: (payload: CarFormPayload) => void;
}

const STATUS_OPTIONS: Array<{ value: CarStatus; label: string }> = [
  { value: "AVAILABLE", label: "AVAILABLE — Siap Disewakan" },
  { value: "RENTED", label: "RENTED — Sedang Disewa" },
  { value: "MAINTENANCE", label: "MAINTENANCE — Perawatan" },
  { value: "INACTIVE", label: "INACTIVE — Tidak Ditawarkan" },
];

export function CarFormDialog({
  open,
  onOpenChange,
  editingCar,
  onSave,
}: CarFormDialogProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [capacityLabel, setCapacityLabel] = useState("7 Kursi");
  const [pricePerDay, setPricePerDay] = useState("300000");
  const [imageUrl, setImageUrl] = useState("/Toyota Avanza.jpg");
  const [status, setStatus] = useState<CarStatus>("AVAILABLE");

  useEffect(() => {
    if (!open) return;
    if (editingCar) {
      setName(editingCar.name);
      setBrand(editingCar.brand);
      setCapacityLabel(editingCar.capacityLabel);
      setPricePerDay(String(editingCar.pricePerDay));
      setImageUrl(editingCar.imageUrl);
      setStatus(editingCar.status);
    } else {
      setName("");
      setBrand("Toyota");
      setCapacityLabel("7 Kursi");
      setPricePerDay("300000");
      setImageUrl("/Toyota Avanza.jpg");
      setStatus("AVAILABLE");
    }
  }, [open, editingCar]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedPrice = Math.max(50000, Number(pricePerDay) || 300000);

    onSave({
      id: editingCar?.id,
      name,
      brand,
      capacityLabel,
      pricePerDay: parsedPrice,
      imageUrl,
      status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gold/25 bg-carbon text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-white">
            {editingCar ? `Edit ${editingCar.name}` : "Tambah Unit Kendaraan"}
          </DialogTitle>
          <DialogDescription className="text-xs text-brand-muted">
            Perbarui informasi unit, tarif harian, dan status operasional.
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
              <Label
                htmlFor="car-brand"
                className="font-mono text-[11px] tracking-wider text-brand-muted uppercase"
              >
                Merek
              </Label>
              <Input
                id="car-brand"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Toyota"
                className="border-hairline bg-obsidian text-white focus-visible:border-gold focus-visible:ring-0"
              />
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
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="font-mono text-xs focus:bg-obsidian focus:text-gold"
                    >
                      {opt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="car-image"
              className="font-mono text-[11px] tracking-wider text-brand-muted uppercase"
            >
              Path / URL Foto
            </Label>
            <Input
              id="car-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/Toyota Avanza.jpg"
              className="border-hairline bg-obsidian font-mono text-xs text-slate-300 focus-visible:border-gold focus-visible:ring-0"
            />
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

