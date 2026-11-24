# Plan Revisi Sistem dari Pemilik Rental

> Dokumen rencana perubahan untuk 3 poin revisi dari pemilik rental:
> 1. Ganti `Merek` pada unit menjadi `Transmisi` (`Matic` / `Manual` / `Matic & Manual`).
> 2. Tambah pilihan `Transmisi` (`Matic` / `Manual`) pada detail booking dengan gaya opsi seperti `Jenis Layanan`.
> 3. Hapus seluruh penomoran (`01`, `02`, dst.) di Landing Page dan Admin Panel.

---

## Task 1 — Database & Backend: Transmisi Unit + Preferensi Transmisi Booking

### 1.1 Prisma Schema & Migration (`backend/prisma/schema.prisma`)
- Tambah enum `TransmissionPreference`:
  ```prisma
  enum TransmissionPreference {
    MATIC
    MANUAL
  }
  ```
- Pada model `Car`:
  - `brand` diubah opsional (`String? @default("-")`) agar tidak memutus data lama.
  - `transmission` diisi konsisten dengan nilai standar `"MATIC" | "MANUAL" | "BOTH"` (default `"BOTH"`).
- Pada model `Booking`:
  - Tambah `transmissionPreference TransmissionPreference @default(MANUAL)`.
- Buat migrasi baru `add_transmission_preference_on_booking` dan jalankan `npx prisma migrate deploy && npx prisma generate`.
- Update `backend/prisma/seed.ts` agar 4 unit awal memiliki `transmission` yang jelas (`"BOTH"` / `"MATIC"` / `"MANUAL"`).

### 1.2 Backend Modules & Tests
- **`backend/src/modules/cars/`** (`car.schema.ts`, `car.service.ts`, `car.repository.ts`):
  - `createCarSchema` & `updateCarSchema`: terima `transmission` (`z.enum(["MATIC", "MANUAL", "BOTH"])` atau string ternormalisasi), jadikan `brand` opsional (`default("-")`).
  - Sertakan `transmission` pada `CarDto`.
- **`backend/src/modules/bookings/`** (`booking.schema.ts`, `booking.repository.ts`, `booking.service.ts`):
  - `createPublicBookingSchema`, `adminCreateBookingSchema`, `updateBookingDetailsSchema`: tambah `transmissionPreference: z.enum(TransmissionPreference).default("MANUAL")`.
  - Simpan & kembalikan `transmissionPreference` pada `BookingDto` & `PublicBookingDto`.
- **Verifikasi TDD:**
  - Update `backend/tests/integration/cars.test.ts` & `backend/tests/integration/bookings.test.ts` untuk memverifikasi `transmission` unit dan `transmissionPreference` booking.
  - Jalankan `npm --prefix backend run typecheck && npm --prefix backend test && npm --prefix backend run build`.

---

## Task 2 — Frontend: Ganti `Merek` Unit menjadi `Transmisi`

- **`frontend/src/features/cars/types/car.types.ts` & `utils/car-admin.ts`:**
  - Tambah tipe `CarTransmission = "MATIC" | "MANUAL" | "BOTH"` dan label `CAR_TRANSMISSION_LABELS` (`Matic`, `Manual`, `Matic / Manual`).
  - Ubah `CarItem` & `CarFormPayload`: `transmission: CarTransmission` (pertahankan `brand?: string` opsional untuk kompatibilitas).
- **`frontend/src/features/cars/components/CarCard.tsx`:**
  - Ganti `car.brand` pada baris metadata kartu menjadi label transmisi (`CAR_TRANSMISSION_LABELS[car.transmission]`).
- **`frontend/src/features/cars/components/AdminCarCard.tsx`:**
  - Ganti `{car.brand} • {car.capacityLabel}` menjadi `{transmissionLabel} • {car.capacityLabel}`.
- **`frontend/src/features/cars/components/CarFormDialog.tsx`:**
  - Ganti field input teks **Merek** menjadi `<Select>` **Transmisi** (`Matic`, `Manual`, `Matic / Manual`).
- **`frontend/src/features/cars/hooks/useAdminCars.ts` & `data/cars.mock.ts`:**
  - Kirim `transmission` saat `saveCar`, hapus ketergantungan wajib pada `brand`.

---

## Task 3 — Frontend: Tambah Pilihan `Transmisi` di Detail Booking (Gaya Jenis Layanan)

- **`frontend/src/features/cars/utils/booking.ts` & `bookings/types/booking.types.ts`:**
  - Tambah `TransmissionPreference = "MATIC" | "MANUAL"` dan `TRANSMISSION_LABELS = { MATIC: "Matic", MANUAL: "Manual" }`.
  - Tambah `transmissionPreference?: TransmissionPreference` di `BookingItem`, `CreateBookingInput`, `UpdateBookingDetailsInput`.
  - Update `buildBookingMessage(...)` agar menyertakan baris `- Transmisi: Matic / Manual` pada pesan WhatsApp.
- **`frontend/src/features/cars/hooks/useBookingForm.ts` & `components/BookingModal.tsx`:**
  - Tambah state `transmissionPreference` (default mengikuti `car.transmission`: jika `MATIC` → `"MATIC"`, selain itu `"MANUAL"`).
  - Tambah radio group **Transmisi** (`Matic` / `Manual`) tepat di bawah **Jenis Layanan** dengan layout & styling tombol yang identik (`grid-cols-2 gap-2`, `role="radiogroup"`). Jika unit hanya memiliki satu tipe transmisi, opsi yang tidak tersedia dinonaktifkan atau dikunci otomatis.
  - Tampilkan baris `Transmisi` di kotak ringkasan sebelum tombol `Konfirmasi Booking →`.
- **`frontend/src/features/bookings/components/AddBookingDialog.tsx` & `BookingDetailSheet.tsx`:**
  - Tambah pemilih 2-tombol **Transmisi** (`Matic` / `Manual`) pada form Tambah Booking dan mode Edit Detail Booking, serta tampilkan `Transmisi` di detail ringkasan booking admin.

---

## Task 4 — Frontend: Hapus Penomoran di Landing Page & Admin Panel

| Area | File | Perubahan |
| --- | --- | --- |
| **Navbar** | `src/lib/constants.ts`, `src/components/layout/Navbar.tsx` | Hapus `code` (`01`–`04`) pada `NAV_LINKS` |
| **Katalog** | `src/features/cars/components/CarCatalogSection.tsx` | `02 / Pilihan Mobil` → `Pilihan Mobil` |
| **Layanan** | `src/features/landing/components/ServicesSection.tsx` | Hapus badge kode `01`, `02` |
| **Cara Booking** | `src/features/landing/components/HowToBookSection.tsx` | Hapus angka langkah `01`–`04` |
| **Tentang** | `src/features/landing/components/AboutSection.tsx` | `03 / Tentang ...` → `Tentang ...` |
| **Admin Sidebar** | `src/features/admin-dashboard/components/AdminSidebar.tsx` | Hapus `{item.code}` (`01`–`07`) pada menu navigasi |
| **Admin Pages** | `src/routes/admin/{index,mobil,booking,kalender,keuangan,testimoni,pengaturan}.tsx` | Hapus prefix `01 /` s.d. `07 /` pada eyebrow judul halaman |

---

## Task 5 — Verifikasi Akhir
- `npm --prefix backend run typecheck && npm --prefix backend test && npm --prefix backend run build`
- `npm --prefix frontend run lint && npm --prefix frontend run build`
- Commit terpisah di branch `feat/backend-setup` (atau branch baru `feat/owner-revisions`).

