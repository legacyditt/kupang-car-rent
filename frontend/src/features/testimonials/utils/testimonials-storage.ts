import { INITIAL_TESTIMONIALS } from "../data/testimonials.mock";
import type { TestimonialItem } from "../types/testimonial.types";

export const TESTIMONIALS_STORAGE_KEY = "aventra-testimonials";
export const TESTIMONIALS_UPDATED_EVENT = "aventra:testimonials-updated";

export function readStoredTestimonials(): TestimonialItem[] {
  try {
    const raw = window.localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
    if (!raw) return INITIAL_TESTIMONIALS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : INITIAL_TESTIMONIALS;
  } catch {
    return INITIAL_TESTIMONIALS;
  }
}

export function writeStoredTestimonials(items: TestimonialItem[]): void {
  try {
    window.localStorage.setItem(
      TESTIMONIALS_STORAGE_KEY,
      JSON.stringify(items)
    );
    window.dispatchEvent(new CustomEvent(TESTIMONIALS_UPDATED_EVENT));
  } catch {
    // Ignore storage write failure in restricted contexts
  }
}

export function subscribeStoredTestimonials(onChange: () => void): () => void {
  const handleCustom = () => onChange();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === TESTIMONIALS_STORAGE_KEY) onChange();
  };

  window.addEventListener(TESTIMONIALS_UPDATED_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(TESTIMONIALS_UPDATED_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

