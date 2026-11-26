# Notifications (shadcn Sonner) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consistent success, error, warning, info, and loading toast notifications for all User/Publik and Admin Dashboard activities using `shadcn/ui` `sonner`, matching the dark obsidian/gold design in `design/notifications.figcraft`.

**Architecture:** Install `sonner` via shadcn CLI (`components/ui/sonner.tsx`), strip `next-themes` dependency in favor of fixed `theme="dark"`, mount `<Toaster />` in `frontend/src/routes/__root.tsx`, centralize toast helpers in `frontend/src/lib/notify.ts`, and wire notifications into public hooks/routes (`useBookingForm`, `ulasan.tsx`) and admin hooks/routes (`useAdminBookings`, `useAdminCars`, `useTestimonials`, `useBusinessProfile`, `admin/pengaturan.tsx`, `admin/login.tsx`, `admin/keuangan.tsx`).

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (`sonner`), TanStack Router, TanStack Query.

---

## File Structure

- Create: `frontend/src/components/ui/sonner.tsx` — shadcn Sonner `<Toaster />` wrapper configured for fixed `dark` theme and Lucide icons.
- Create: `frontend/src/lib/notify.ts` — shared notification helpers (`notifySuccess`, `notifyError`, `notifyWarning`, `notifyInfo`, `notifyBookingSuccess` with `Salin` clipboard action).
- Modify: `frontend/src/routes/__root.tsx` — mount `<Toaster />` at app root so both public and admin routes receive toasts.
- Modify: `frontend/src/features/cars/hooks/useBookingForm.ts` — emit loading/success (`Salin` kode booking) and error toasts on booking submission.
- Modify: `frontend/src/routes/ulasan.tsx` — emit success/error toasts on customer review submission.
- Modify: `frontend/src/features/bookings/hooks/useAdminBookings.ts` — emit success/error/warning toasts on status change, notes/price save, add/edit booking, payment update, and extend booking.
- Modify: `frontend/src/features/cars/hooks/useAdminCars.ts` — emit success/error toasts on car and car-unit CRUD/status actions.
- Modify: `frontend/src/features/testimonials/hooks/useTestimonials.ts` — emit success/error toasts on admin testimonial moderation and CRUD.
- Modify: `frontend/src/features/business-profile/hooks/useBusinessProfile.ts` & `frontend/src/routes/admin/pengaturan.tsx` — emit success/error toasts on profile save and logo reset (replacing local `savedToast` banner).
- Modify: `frontend/src/routes/admin/login.tsx` — emit success/error toasts on login, OTP request, and password reset.
- Modify: `frontend/src/routes/admin/keuangan.tsx` — emit info/error toasts on Excel and PDF export.

---

### Task 1: Install shadcn `sonner` and Mount `<Toaster />`

**Files:**
- Create: `frontend/src/components/ui/sonner.tsx`
- Modify: `frontend/package.json`
- Modify: `frontend/src/routes/__root.tsx:1-5`

- [ ] **Step 1: Install `sonner` component via shadcn CLI**

Run inside `frontend/`:
```powershell
cd frontend; npx shadcn@latest add sonner --yes
```
Expected: `sonner` package added to `frontend/package.json` and `frontend/src/components/ui/sonner.tsx` created.

- [ ] **Step 2: Remove `next-themes` dependency from `frontend/src/components/ui/sonner.tsx` and force dark obsidian styling**

Update `frontend/src/components/ui/sonner.tsx`:
```tsx
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      richColors
      closeButton
      visibleToasts={3}
      duration={4000}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "font-sans border border-hairline bg-carbon text-brand-text shadow-2xl rounded-xl",
          title: "font-semibold text-[13px]",
          description: "text-xs text-brand-muted",
          actionButton:
            "!bg-gold !text-obsidian font-mono !text-[11px] !font-bold uppercase tracking-wider",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
```

- [ ] **Step 3: Mount `<Toaster />` in `frontend/src/routes/__root.tsx`**

```tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});
```

- [ ] **Step 4: Typecheck and build frontend**

Run:
```powershell
cd frontend; npm run lint; npm run build
```
Expected: exit code `0`, no TypeScript or Vite build errors.

- [ ] **Step 5: Commit**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/src/components/ui/sonner.tsx frontend/src/routes/__root.tsx
git commit -m "feat(ui): install shadcn sonner and mount global Toaster"
```

---

### Task 2: Create `frontend/src/lib/notify.ts` Helper

**Files:**
- Create: `frontend/src/lib/notify.ts`

- [ ] **Step 1: Create `frontend/src/lib/notify.ts` with typed wrappers**

```ts
import { toast } from "sonner";

export function notifySuccess(title: string, description?: string) {
  return toast.success(title, { description });
}

export function notifyError(title: string, description?: string) {
  return toast.error(title, { description, duration: 5000 });
}

export function notifyWarning(title: string, description?: string) {
  return toast.warning(title, { description, duration: 5000 });
}

export function notifyInfo(title: string, description?: string) {
  return toast.info(title, { description });
}

export function notifyLoading(title: string, description?: string) {
  return toast.loading(title, { description });
}

export function notifyBookingSuccess(bookingCode: string) {
  return toast.success("Booking berhasil dikirim!", {
    description: `Kode ${bookingCode} · Lanjut ke WhatsApp.`,
    duration: 6000,
    action: {
      label: "Salin",
      onClick: () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          void navigator.clipboard.writeText(bookingCode).then(() => {
            toast.success("Kode booking disalin", { description: bookingCode });
          });
        }
      },
    },
  });
}
```

- [ ] **Step 2: Typecheck frontend**

Run:
```powershell
cd frontend; npm run lint
```
Expected: exit code `0`.

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/lib/notify.ts
git commit -m "feat(ui): add centralized sonner notification helpers"
```

---

### Task 3: Wire User / Publik Notifications (`useBookingForm` & `ulasan.tsx`)

**Files:**
- Modify: `frontend/src/features/cars/hooks/useBookingForm.ts:131-188`
- Modify: `frontend/src/routes/ulasan.tsx:75-95`

- [ ] **Step 1: Add loading, success (`Salin` kode), and error toasts to `frontend/src/features/cars/hooks/useBookingForm.ts`**

Import `toast` from `"sonner"` and `notifyBookingSuccess`, `notifyError`, `notifyLoading` from `"@/lib/notify"`. Inside `handleSubmit`:
```ts
    submitLockRef.current = true;
    setIsSubmitting(true);
    setErrorMsg(null);
    const toastId = notifyLoading(
      "Mengirim permintaan booking...",
      "Sedang memeriksa ketersediaan unit."
    );
    try {
      const booking = await apiFetch<BookingItem>("/bookings", {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          carId: car.id,
          customerName: trimmedName,
          customerPhone: phone,
          startDate: ddmmyyyyToYyyymmdd(startDate),
          endDate: ddmmyyyyToYyyymmdd(endDate),
          serviceType,
          transmissionPreference,
          paymentScheme: effectivePaymentScheme,
        }),
      });

      await qc.invalidateQueries({ queryKey: PUBLIC_CARS_QUERY_KEY });
      toast.dismiss(toastId);
      notifyBookingSuccess(booking.bookingCode);

      const message = buildBookingMessage({
        car,
        name: trimmedName,
        phone: booking.customerPhone,
        bookingCode: booking.bookingCode,
        serviceType,
        transmissionPreference,
        paymentScheme: effectivePaymentScheme,
        startDate,
        endDate,
        totalDays,
        totalPrice,
      });

      window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
      setName("");
      setPhone("");
      setPaymentScheme("FULL");
      setStartDate(null);
      setEndDate(null);
      setErrorMsg(null);
      resetIdempotencyKey();
      onSuccess();
    } catch (err) {
      toast.dismiss(toastId);
      const message =
        err instanceof ApiError
          ? err.message
          : "Gagal mengirim booking. Coba lagi.";
      setErrorMsg(message);
      notifyError("Booking gagal dikirim", message);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
```

- [ ] **Step 2: Add success & error toasts to `frontend/src/routes/ulasan.tsx`**

Import `notifyError`, `notifySuccess` from `"@/lib/notify"`. Inside `handleSubmit`:
```ts
    await runWithLock(async () => {
      try {
        const created = await apiFetch<{ customerName: string }>("/testimonials", {
          method: "POST",
          body: JSON.stringify({
            bookingCode: booking.bookingCode,
            customerName,
            rating,
            tripLabel: booking.tripLabel,
            quote,
          }),
        });
        setSubmittedName(created.customerName);
        notifySuccess(
          "Terima kasih atas ulasan Anda!",
          "Ulasan diterima dan menunggu peninjauan admin."
        );
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Gagal mengirim ulasan.";
        setErrorMsg(message);
        notifyError("Gagal mengirim ulasan", message);
      }
    });
```

- [ ] **Step 3: Typecheck and build**

Run:
```powershell
cd frontend; npm run lint; npm run build
```
Expected: exit code `0`.

- [ ] **Step 4: Commit**

```powershell
git add frontend/src/features/cars/hooks/useBookingForm.ts frontend/src/routes/ulasan.tsx
git commit -m "feat(ui): add sonner notifications for public booking and review submission"
```

---

### Task 4: Wire Admin Booking & Calendar Notifications (`useAdminBookings.ts`)

**Files:**
- Modify: `frontend/src/features/bookings/hooks/useAdminBookings.ts:63-205`

- [ ] **Step 1: Add success, error, and schedule-conflict warning toasts in `frontend/src/features/bookings/hooks/useAdminBookings.ts`**

Import `notifyError`, `notifySuccess`, `notifyWarning` from `"@/lib/notify"` and `BOOKING_STATUS_LABELS` from `"../utils/booking-admin"`.
Wire each mutation:
- `changeStatus`: on success -> `notifySuccess(\`Status diubah ke ${BOOKING_STATUS_LABELS[nextStatus]}\`)`; on error -> `notifyError("Gagal mengubah status", message)`.
- `saveNotesAndPrice`: on success -> `notifySuccess("Catatan & harga disimpan")`; on error -> `notifyError("Gagal menyimpan perubahan", message)`.
- `addBooking`: on success -> if `conflict`, `notifyWarning("Booking ditambahkan dengan bentrok jadwal", \`Kode ${booking.bookingCode} bentrok dengan ${conflict.bookingCode}.\`)`; else `notifySuccess("Booking berhasil ditambahkan", \`Kode ${booking.bookingCode}\`)`. On error -> `notifyError("Gagal menambahkan booking", message)`.
- `editBooking`: on success -> `notifySuccess("Detail booking diperbarui")`; on error -> `notifyError("Gagal mengedit booking", message)`.
- `updatePayment`: on success -> `notifySuccess("Pembayaran diperbarui", \`Status: ${updates.paymentStatus === "PAID" ? "Lunas" : updates.paymentStatus === "DP_PAID" ? "DP Terbayar" : "Belum Bayar"}\`)`; on error -> `notifyError("Gagal mengubah pembayaran", message)`.
- `extendBooking`: on success -> `notifySuccess("Sewa berhasil diperpanjang", \`Tanggal selesai baru: ${newEndDate}\`)`; on error -> `notifyError("Gagal memperpanjang sewa", message)`.

- [ ] **Step 2: Typecheck and build**

Run:
```powershell
cd frontend; npm run lint; npm run build
```
Expected: exit code `0`.

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/features/bookings/hooks/useAdminBookings.ts
git commit -m "feat(admin): add sonner notifications for booking management actions"
```

---

### Task 5: Wire Admin Cars, Testimonials, Settings, Login, & Finance Export

**Files:**
- Modify: `frontend/src/features/cars/hooks/useAdminCars.ts:46-116`
- Modify: `frontend/src/features/testimonials/hooks/useTestimonials.ts:59-94`
- Modify: `frontend/src/features/business-profile/hooks/useBusinessProfile.ts:20-57`
- Modify: `frontend/src/routes/admin/pengaturan.tsx:24-95`
- Modify: `frontend/src/routes/admin/login.tsx:129-230`
- Modify: `frontend/src/routes/admin/keuangan.tsx:64-85`

- [ ] **Step 1: Wire `useAdminCars.ts`**

Import `ApiError` from `"@/lib/api"` and `notifyError`, `notifySuccess` from `"@/lib/notify"`. Wrap `saveCar`, `changeCarStatus`, `addCarUnit`, `updateCarUnit`, `deleteCarUnit` with `try/catch` so on success they emit `notifySuccess(...)` (e.g. `"Unit armada ditambahkan"` / `"Unit armada diperbarui"`, `"Status armada diperbarui"`, `"Unit fisik ditambahkan"`, `"Unit fisik diperbarui"`, `"Unit fisik dihapus"`) and on error emit `notifyError(...)` before rethrowing `err` so dialog error states still work.

- [ ] **Step 2: Wire `useTestimonials.ts`**

Import `notifyError`, `notifySuccess` from `"@/lib/notify"`. Wrap `changeStatus`, `saveTestimonial`, `removeTestimonial` with `try/catch` to emit `notifySuccess` (`"Status ulasan diperbarui"`, `"Testimoni disimpan"`, `"Testimoni dihapus"`) and `notifyError` on failure (rethrowing `err`).

- [ ] **Step 3: Wire `useBusinessProfile.ts` & clean up `admin/pengaturan.tsx`**

In `useBusinessProfile.ts`: emit `notifySuccess("Profil bisnis disimpan")` / `notifyError("Gagal menyimpan profil bisnis", message)` in `saveProfile`, and `notifySuccess("Logo direset ke default")` / `notifyError("Gagal mereset logo", message)` in `resetLogo`.
In `admin/pengaturan.tsx`: remove local `savedToast` state and inline emerald banner so feedback uses the global Sonner toast consistently.

- [ ] **Step 4: Wire `admin/login.tsx`**

Import `notifyError`, `notifySuccess` from `"@/lib/notify"`.
- On `login` success -> `notifySuccess("Login berhasil", "Selamat datang kembali.")`; on failure -> `notifyError("Login gagal", res.error)`.
- On `requestOtpReset` success -> `notifySuccess("Kode OTP dikirim", "Cek WhatsApp admin terdaftar.")`; on failure -> `notifyError("Gagal mengirim OTP", res.error)`.
- On `resetPasswordWithOtp` success -> `notifySuccess("Password berhasil direset", "Silakan login dengan password baru.")`; on failure -> `notifyError("Reset password gagal", res.error)`.

- [ ] **Step 5: Wire `admin/keuangan.tsx`**

Import `notifyError`, `notifyInfo` from `"@/lib/notify"`.
- Wrap `exportFinanceToExcel` click handler: emit `notifyInfo("Laporan Excel diunduh", "File .xlsx siap dibuka.")` (or `notifyError` on throw).
- Wrap `exportFinanceToPdf` click handler: `await exportFinanceToPdf(...)` then emit `notifyInfo("Laporan PDF diunduh", "File .pdf siap dibuka.")` (or `notifyError` on throw).

- [ ] **Step 6: Typecheck, build, and verify**

Run:
```powershell
cd frontend; npm run lint; npm run build
```
Expected: exit code `0`, clean build output in `frontend/dist/`.

- [ ] **Step 7: Commit**

```powershell
git add frontend/src/features/cars/hooks/useAdminCars.ts frontend/src/features/testimonials/hooks/useTestimonials.ts frontend/src/features/business-profile/hooks/useBusinessProfile.ts frontend/src/routes/admin/pengaturan.tsx frontend/src/routes/admin/login.tsx frontend/src/routes/admin/keuangan.tsx
git commit -m "feat(admin): add sonner notifications for cars, testimonials, settings, login, and finance export"
```

