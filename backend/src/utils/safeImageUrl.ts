const RASTER_DATA_URL_REGEX =
  /^data:image\/(?:png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i;

/** Validates that an image URL is a relative path, HTTPS URL, or raster PNG/JPEG/WEBP Data URL. */
export function isSafeImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    return true;
  }
  if (RASTER_DATA_URL_REGEX.test(trimmed)) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:") return true;
    if (
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

