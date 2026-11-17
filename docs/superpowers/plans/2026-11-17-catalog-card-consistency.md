# Katalog Card Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bikin kartu katalog seragam: gambar mobil ukuran/background sama, judul dan CTA sejajar di grid maupun carousel.

**Architecture:** Normalisasi 4 aset sekali via script Pillow ke canvas 1600×1000 putih, lalu perapian kelas Tailwind di `CarCard` dan breakpoint grid di `CarCatalogSection`. Tidak ada dependency runtime baru; data mock tetap dipakai apa adanya.

**Tech Stack:** Python 3.14 + Pillow 13.0.0 (one-off asset script), React 19 + TypeScript + Tailwind CSS 4 + Vite 6, Node built-in `node:test` untuk regression test statis.

---

### Task 1: Script normalisasi aset + test

**Files:**
- Create: `scripts/__init__.py`
- Create: `scripts/normalize_car_images.py`
- Test: `tests/test_normalize_car_images.py`

- [ ] **Step 1: Tulis failing test**

`tests/test_normalize_car_images.py`:

```python
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from scripts.normalize_car_images import normalize_image


class NormalizeCarImagesTest(unittest.TestCase):
    def test_white_background_source_becomes_white_1600x1000_canvas(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "car.jpg"
            image = Image.new("RGB", (400, 200), (255, 255, 255))
            for x in range(100, 300):
                for y in range(50, 150):
                    image.putpixel((x, y), (10, 20, 30))
            image.save(src, "JPEG")

            out = normalize_image(src)

            with Image.open(out) as result:
                self.assertEqual(result.size, (1600, 1000))
                self.assertEqual(result.mode, "RGB")
                self.assertEqual(result.getpixel((0, 0)), (255, 255, 255))
                self.assertLess(sum(result.getpixel((800, 500))), 200)

    def test_transparent_png_is_flattened_onto_white_canvas(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "car.png"
            image = Image.new("RGBA", (300, 150), (0, 0, 0, 0))
            for x in range(50, 250):
                for y in range(25, 125):
                    image.putpixel((x, y), (200, 30, 40, 255))
            image.save(src, "PNG")

            out = normalize_image(src)

            with Image.open(out) as result:
                self.assertEqual(result.size, (1600, 1000))
                self.assertEqual(result.mode, "RGB")
                self.assertEqual(result.getpixel((0, 0)), (255, 255, 255))
                self.assertGreater(result.getpixel((800, 500))[0], 150)


if __name__ == "__main__":
    unittest.main()
```

`scripts/__init__.py` → kosong.

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `python -m unittest discover -s tests -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'scripts.normalize_car_images'`

- [ ] **Step 3: Implementasi minimal**

`scripts/normalize_car_images.py`:

```python
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageChops

CANVAS_SIZE = (1600, 1000)
MAX_WIDTH_RATIO = 0.88
MAX_HEIGHT_RATIO = 0.78
PADDING_RATIO = 0.02
DIFF_THRESHOLD = 10

SOURCE_FILES = (
    "Toyota Avanza.jpg",
    "Honda Brio.jpeg",
    "Toyota Hilux.jpg",
    "Toyota Innova Reborn.png",
)


def content_bbox(image: Image.Image) -> tuple[int, int, int, int] | None:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    if alpha.getextrema()[0] < 255:
        return alpha.point(lambda value: 255 if value > 0 else 0).getbbox()

    rgb = rgba.convert("RGB")
    diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, (255, 255, 255)))
    mask = diff.convert("L").point(lambda value: 255 if value > DIFF_THRESHOLD else 0)
    return mask.getbbox()


def padded_bbox(
    bbox: tuple[int, int, int, int], size: tuple[int, int]
) -> tuple[int, int, int, int]:
    left, upper, right, lower = bbox
    pad_x = max(1, round((right - left) * PADDING_RATIO))
    pad_y = max(1, round((lower - upper) * PADDING_RATIO))
    return (
        max(0, left - pad_x),
        max(0, upper - pad_y),
        min(size[0], right + pad_x),
        min(size[1], lower + pad_y),
    )


def normalize_image(src: Path, dst: Path | None = None) -> Path:
    target = dst or src
    with Image.open(src) as original:
        bbox = content_bbox(original)
        if bbox is None:
            raise ValueError(f"Tidak ada isi pada {src.name}")

        crop = original.crop(padded_bbox(bbox, original.size)).convert("RGBA")
        max_width = round(CANVAS_SIZE[0] * MAX_WIDTH_RATIO)
        max_height = round(CANVAS_SIZE[1] * MAX_HEIGHT_RATIO)
        scale = min(max_width / crop.width, max_height / crop.height)
        resized = crop.resize(
            (
                max(1, round(crop.width * scale)),
                max(1, round(crop.height * scale)),
            ),
            Image.Resampling.LANCZOS,
        )

        canvas = Image.new("RGB", CANVAS_SIZE, (255, 255, 255))
        canvas.paste(
            resized,
            (
                (CANVAS_SIZE[0] - resized.width) // 2,
                (CANVAS_SIZE[1] - resized.height) // 2,
            ),
            resized,
        )

        suffix = target.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            canvas.save(target, "JPEG", quality=92)
        elif suffix == ".png":
            canvas.save(target, "PNG")
        else:
            raise ValueError(f"Format tidak didukung: {target.suffix}")

    return target


def main() -> int:
    public_dir = Path(__file__).resolve().parents[1] / "frontend" / "public"
    failures = 0
    for name in SOURCE_FILES:
        path = public_dir / name
        try:
            normalize_image(path)
            print(f"OK   {name}")
        except Exception as exc:  # lapor per file, lanjut ke file berikutnya
            failures += 1
            print(f"FAIL {name}: {exc}", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `python -m unittest discover -s tests -v`
Expected: `Ran 2 tests ... OK`

- [ ] **Step 5: Commit**

```bash
git add scripts/__init__.py scripts/normalize_car_images.py tests/test_normalize_car_images.py
git commit -m "test: add car image normalization script with tests"
```

---

### Task 2: Normalisasi 4 aset nyata

**Files:**
- Modify: `frontend/public/Toyota Avanza.jpg`
- Modify: `frontend/public/Honda Brio.jpeg`
- Modify: `frontend/public/Toyota Hilux.jpg`
- Modify: `frontend/public/Toyota Innova Reborn.png`

- [ ] **Step 1: Jalankan normalisasi**

Run: `python scripts/normalize_car_images.py`
Expected: empat baris `OK ...`, tidak ada `FAIL ...`.

- [ ] **Step 2: Verifikasi hasil**

Run:

```bash
python -c "from PIL import Image; from pathlib import Path; p=Path('frontend/public'); names=['Toyota Avanza.jpg','Honda Brio.jpeg','Toyota Hilux.jpg','Toyota Innova Reborn.png']; [(lambda im,n: print(n, im.size, im.mode, im.getpixel((0,0))))(Image.open(p/n),n) for n in names]"
```

Expected: tiap baris `(1600, 1000) RGB (255, 255, 255)`.

- [ ] **Step 3: Stage aset + perubahan path yang sudah ada di working tree**

```bash
git add -f "frontend/public/Toyota Avanza.jpg" "frontend/public/Honda Brio.jpeg" "frontend/public/Toyota Hilux.jpg" "frontend/public/Toyota Innova Reborn.png"
git add -u frontend/public
git add frontend/src/features/cars/data/cars.mock.ts
```

- [ ] **Step 4: Commit**

```bash
git commit -m "assets: normalize catalog car images to uniform canvas"
```

---

### Task 3: Rapikan `CarCard.tsx`

**Files:**
- Modify: `frontend/src/features/cars/components/CarCard.tsx`
- Test: `frontend/tests/car-card.test.mjs`

- [ ] **Step 1: Tulis failing test**

`frontend/tests/car-card.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/features/cars/components/CarCard.tsx", import.meta.url),
  "utf8"
);

test("CarCard clamps title and pins CTA to bottom", () => {
  assert.match(source, /line-clamp-2 min-h-\[3\.5rem\]/);
  assert.match(source, /mt-auto pt-4/);
  assert.doesNotMatch(source, /className="mt-4 w-full"/);
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `node --test frontend/tests/car-card.test.mjs`
Expected: FAIL — `The input did not match ... /line-clamp-2 .../`

- [ ] **Step 3: Implementasi**

Timpa `frontend/src/features/cars/components/CarCard.tsx` dengan:

```tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CarItem } from "../types/car.types";

interface CarCardProps {
  car: CarItem;
  prioritizeImage?: boolean;
}

export function CarCard({ car, prioritizeImage = false }: CarCardProps) {
  const detailMessage = `Halo, saya tertarik menyewa ${car.name} (${car.category}). Mohon info ketersediaannya.`;
  const metadata = [
    car.capacityLabel !== "—" ? `Kapasitas: ${car.capacityLabel}` : null,
    car.transmissionLabel !== "—" ? `Transmisi: ${car.transmissionLabel}` : null,
  ].filter(Boolean);

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-[14px] border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative flex aspect-[16/10] w-full items-center justify-center bg-white p-3">
        <img
          src={car.imageUrl}
          alt={`${car.name} - ${car.category}`}
          loading={prioritizeImage ? undefined : "lazy"}
          width={320}
          height={200}
          className="h-full w-full object-contain"
        />
        {car.status === "AVAILABLE" && (
          <Badge variant="available" className="absolute right-3 top-3">
            Tersedia
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-5 pt-2">
        <span className="text-xs font-semibold text-brand-blue">
          {car.category}
        </span>
        <h3 className="mt-1 line-clamp-2 min-h-[3.5rem] text-lg font-bold text-brand-text">
          {car.name}
        </h3>

        {metadata.length > 0 && (
          <p className="mt-1.5 min-h-[1.25rem] text-xs text-brand-muted">
            {metadata.join(" • ")}
          </p>
        )}

        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-brand-navy">
            {formatRupiah(car.pricePerDay)}
          </span>
          <span className="text-xs text-brand-muted">/ hari</span>
        </div>

        <div className="mt-auto pt-4">
          <Button asChild className="w-full">
            <a
              href={buildWhatsAppUrl(detailMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lihat Detail
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Verifikasi test + tipe**

Run: `node --test frontend/tests/car-card.test.mjs`
Expected: PASS

Run: `cd frontend && npm run lint`
Expected: tidak ada error TypeScript.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/cars/components/CarCard.tsx frontend/tests/car-card.test.mjs
git commit -m "fix: align catalog card title, metadata, and CTA"
```

---

### Task 4: Rapikan grid katalog

**Files:**
- Modify: `frontend/src/features/cars/components/CarCatalogSection.tsx`
- Test: `frontend/tests/car-catalog-section.test.mjs`

- [ ] **Step 1: Tulis failing test**

`frontend/tests/car-catalog-section.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL(
    "../src/features/cars/components/CarCatalogSection.tsx",
    import.meta.url
  ),
  "utf8"
);

test("catalog grid stacks on mobile and uses sm/lg breakpoints", () => {
  assert.match(
    source,
    /mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4/
  );
  assert.doesNotMatch(source, /hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4/);
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `node --test frontend/tests/car-catalog-section.test.mjs`
Expected: FAIL — tidak menemukan kelas grid baru.

- [ ] **Step 3: Implementasi**

Di `frontend/src/features/cars/components/CarCatalogSection.tsx`, ganti baris:

```tsx
        {/* Desktop & Tablet: 2-4 Column Grid */}
        <div className="mt-10 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4">
```

dengan:

```tsx
        {/* Desktop & Tablet: 1-4 Column Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
```

- [ ] **Step 4: Verifikasi test + build**

Run: `node --test frontend/tests/car-catalog-section.test.mjs`
Expected: PASS

Run: `cd frontend && npm run build`
Expected: build sukses, tidak ada error TypeScript.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/cars/components/CarCatalogSection.tsx frontend/tests/car-catalog-section.test.mjs
git commit -m "fix: make catalog grid responsive from mobile up"
```

---

### Task 5: Verifikasi akhir

**Files:** tidak ada perubahan file baru.

- [ ] **Step 1: Jalankan semua test**

Run: `python -m unittest discover -s tests -v`
Expected: 2 tests OK

Run: `node --test frontend/tests/*.test.mjs`
Expected: 2 tests PASS

- [ ] **Step 2: Build produksi**

Run: `cd frontend && npm run build`
Expected: sukses.

- [ ] **Step 3: Cek status git**

Run: `git status --short`
Expected: hanya `scripts/`, `tests/`, `frontend/tests/`, 4 aset, `CarCard.tsx`, `CarCatalogSection.tsx`, `cars.mock.ts`, dan penghapusan `.webp` lama yang muncul; `vite-env.d.ts` tidak ikut ter-commit.

- [ ] **Step 4: Cek visual manual (user)**

Run: `cd frontend && npm run dev`
Expected di browser:
- 4 kartu tinggi sama, tombol "Lihat Detail" sejajar.
- Mobil tampak sama besar, background putih semua.
- Carousel mobile tetap bisa swipe; dot aktif sinkron.
