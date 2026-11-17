# Katalog Card Consistency — Design Spec

Tanggal: 2026-11-17
Status: Disetujui user (opsi 1: normalisasi aset + CSS)

## Tujuan

Bikin kartu katalog rapi: ukuran mobil seragam, background seragam, judul/harga/tombol sejajar di grid maupun carousel.

## Kondisi saat ini

- `frontend/src/features/cars/components/CarCard.tsx`
  - Gambar: `aspect-[16/10]`, `object-contain`, `p-4`.
  - CTA: `mt-4` (tidak `mt-auto`), jadi naik-turun kalau judul wrap.
  - Metadata `— Kursi` / `—` tetap dirender.
- `frontend/src/features/cars/components/CarCatalogSection.tsx`
  - Grid: `hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4`.
  - Carousel mobile: `w-[82%]` per slide.
- `frontend/public/` (working tree saat ini, Pillow 13.0.0):
  - `Toyota Avanza.jpg` — 439×270, RGB, corner putih.
  - `Honda Brio.jpeg` — 930×620, RGB, corner putih.
  - `Toyota Hilux.jpg` — 930×529, RGB.
  - `Toyota Innova Reborn.png` — 600×300, mode `P`, corner transparan (alpha 0 setelah RGBA).
  - File `.webp` lama (`Toyota Avanza.webp`, `Toyota Hilux.webp`) sudah dihapus di working tree.
- `.gitignore:29` berisi `public/`, sehingga file `.jpg` baru **tidak ter-track**. `cars.mock.ts` sudah diubah user ke `.jpg` untuk Avanza & Hilux — perubahan ini dihormati, tidak dikembalikan ke `.webp`.
- `cars.mock.ts` — semua `capacityLabel`/`transmissionLabel` berisi `—`; semua harga `300000`.

Masalah: rasio sumber beda + background campur (putih vs transparan) + `object-contain` bikin mobil tampil beda ukuran. CTA tidak sejajar antar kartu.

## Keputusan

Normalisasi aset gambar + perapian CSS. Tidak menambah dependency runtime. Tidak pakai image generation.

## Perubahan

### 1. Aset (script one-off Python/Pillow)

Script `scripts/normalize_car_images.py` memproses 4 file aktif: `Toyota Avanza.jpg`, `Honda Brio.jpeg`, `Toyota Hilux.jpg`, `Toyota Innova Reborn.png` di `frontend/public/`:

- Decode dengan Pillow. File `.webp` lama tidak diproses.
- Tentukan bounding box isi:
  - Ada alpha → bbox pixel dengan alpha > 0.
  - Tanpa alpha → bbox pixel yang tidak near-white (minimal satu channel < 245).
- Crop ke bbox + padding 2%.
- Tempel ke canvas RGB `1600×1000` ber-background putih.
- Scale isi: tinggi maksimal 78% canvas, lebar maksimal 88% canvas, aspect ratio dipertahankan, posisi center.
- Simpan **timpa path asli**, format mengikuti ekstensi:
  - `.jpg` / `.jpeg` → JPEG, quality 92, RGB.
  - `.png` → PNG, RGB (alpha di-flatten ke putih).
- `hero-kupang.jpg` tidak disentuh.
- `cars.mock.ts` tetap pakai `imageUrl` yang sama — tidak ada perubahan path.
- Karena `public/` di-ignore, 4 file hasil normalisasi wajib di-`git add -f` saat commit agar tidak hilang di repo. File `.webp` lama yang sudah dihapus user dibiarkan terhapus; jangan di-restore tanpa konfirmasi.

Error handling: kalau satu file gagal decode, script catat error dan lanjut ke file lain; tidak menggagalkan pemrosesan file lain. Lapor hasil per file.

### 2. `CarCard.tsx`

- Image wrapper: `relative flex aspect-[16/10] w-full items-center justify-center bg-white p-3` (dari `p-4`).
- `<img>` tetap `object-contain` + width/height atribut.
- Badge "Tersedia" tetap.
- `<h3>`: `mt-1 line-clamp-2 min-h-[3.5rem] text-lg font-bold ...`.
- Baris metadata:
  - Render hanya kalau `capacityLabel !== "—"` atau `transmissionLabel !== "—"`.
  - Field bernilai `—` tidak ditampilkan; yang tersisa digabung dengan `•`.
  - Wrapper: `mt-1.5 min-h-[1.25rem] text-xs ...`.
- Harga tetap.
- CTA: bungkus dengan `<div className="mt-auto pt-4">` menggantikan `className="mt-4 w-full"` pada `Button`. `CardContent` tetap `flex flex-1 flex-col`.

### 3. `CarCatalogSection.tsx`

- Grid desktop/tablet: `mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4` (hapus `hidden ... md:grid`).
- Carousel mobile tetap `md:hidden`, `w-[82%]`, navigasi, dan `liveStatus` tidak diubah.
- Kartu di carousel memakai `CarCard` yang sudah diperbarui.
- Tombol "Lihat Semua Mobil" tidak diubah.

### 4. Data

- `cars.mock.ts` tidak diubah. Placeholder `—` ditangani di UI (disembunyikan), bukan di data.

## Arsitektur & alur data

`INITIAL_CARS` → `CarCatalogSection` → `CarCard` → `<img src={car.imageUrl}>`.
Aset dinormalisasi sekali saat development, bukan saat runtime. Komponen tetap menerima `CarItem` apa adanya.

## Testing & verifikasi

1. Script normalisasi: buka ulang 4 gambar, pastikan ukuran `1600×1000` dan corner putih `(255,255,255)`.
2. `cd frontend && npm run build` — harus sukses, tanpa error TypeScript.
3. `npm run dev` + cek visual:
   - 4 kartu tinggi sama, CTA sejajar di satu baris.
   - Ukuran mobil tampak sama, background putih semua, tidak ada hitam/transparan.
   - Carousel mobile tetap bisa swipe dan dot aktif sinkron.
4. `git status` — hanya file yang dimaksud yang berubah.

## Di luar scope

- Mengisi data kapasitas/transmisi asli.
- Menambah fitur filter, pagination, atau detail modal.
- Mengubah warna/bahasa brand.
