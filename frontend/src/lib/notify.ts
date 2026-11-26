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
