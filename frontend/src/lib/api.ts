export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

export const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const errObj = payload?.error;
    throw new ApiError(
      res.status,
      errObj?.code ?? "REQUEST_FAILED",
      errObj?.message ?? `Permintaan gagal (${res.status}).`
    );
  }

  return (payload?.data ?? payload) as T;
}

export async function uploadAdminImage(
  endpoint: "/admin/uploads/car-image" | "/admin/uploads/logo",
  file: File
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{ url: string; publicId: string }>(endpoint, {
    method: "POST",
    body: formData,
  });
}

