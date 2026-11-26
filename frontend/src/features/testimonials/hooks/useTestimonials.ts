import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";
import type {
  TestimonialItem,
  TestimonialStatus,
  UpsertTestimonialInput,
} from "../types/testimonial.types";

export const PUBLIC_TESTIMONIALS_QUERY_KEY = ["public-testimonials"] as const;
export const ADMIN_TESTIMONIALS_QUERY_KEY = ["admin-testimonials"] as const;

export function usePublicTestimonials() {
  return useQuery({
    queryKey: PUBLIC_TESTIMONIALS_QUERY_KEY,
    queryFn: () => apiFetch<TestimonialItem[]>("/testimonials"),
  });
}

export function useTestimonials() {
  const qc = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ADMIN_TESTIMONIALS_QUERY_KEY,
    queryFn: () => apiFetch<TestimonialItem[]>("/admin/testimonials"),
  });

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ADMIN_TESTIMONIALS_QUERY_KEY }),
      qc.invalidateQueries({ queryKey: PUBLIC_TESTIMONIALS_QUERY_KEY }),
    ]);
  };

  const submitPublic = async (input: {
    bookingCode: string;
    customerName?: string;
    rating: number;
    tripLabel: string;
    quote: string;
  }): Promise<
    { ok: true; item: TestimonialItem } | { ok: false; error: string }
  > => {
    try {
      const item = await apiFetch<TestimonialItem>("/testimonials", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await invalidate();
      return { ok: true, item };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof ApiError ? err.message : "Gagal mengirim testimoni.",
      };
    }
  };

  const changeStatus = async (id: string, status: TestimonialStatus) => {
    try {
      await apiFetch<TestimonialItem>(`/admin/testimonials/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await invalidate();
      notifySuccess("Status ulasan diperbarui");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Gagal mengubah status ulasan.";
      notifyError("Gagal mengubah status ulasan", message);
      throw err;
    }
  };

  const saveTestimonial = async (input: UpsertTestimonialInput) => {
    const body = {
      customerName: input.customerName,
      carName: input.carName,
      tripLabel: input.tripLabel,
      rating: input.rating,
      quote: input.quote,
      status: input.status,
    };

    try {
      if (input.id) {
        await apiFetch<TestimonialItem>(`/admin/testimonials/${input.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch<TestimonialItem>("/admin/testimonials", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      await invalidate();
      notifySuccess(
        input.id ? "Testimoni diperbarui" : "Testimoni ditambahkan"
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal menyimpan testimoni.";
      notifyError("Gagal menyimpan testimoni", message);
      throw err;
    }
  };

  const removeTestimonial = async (id: string) => {
    try {
      await apiFetch(`/admin/testimonials/${id}`, { method: "DELETE" });
      await invalidate();
      notifySuccess("Testimoni dihapus");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal menghapus testimoni.";
      notifyError("Gagal menghapus testimoni", message);
      throw err;
    }
  };

  return {
    testimonials,
    publishedTestimonials: testimonials.filter((t) => t.status === "PUBLISHED"),
    isLoading,
    submitPublic,
    changeStatus,
    saveTestimonial,
    removeTestimonial,
  };
}
