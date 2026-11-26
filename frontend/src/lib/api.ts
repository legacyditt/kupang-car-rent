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

interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  allowedFormats: string;
  publicId?: string;
  uploadPreset?: string;
}

const UPLOAD_POLICIES = {
  "/admin/uploads/car-image": {
    target: "car-image" as const,
    maxBytes: 5 * 1024 * 1024,
    maxLabel: "5 MB",
  },
  "/admin/uploads/logo": {
    target: "logo" as const,
    maxBytes: 1_048_576,
    maxLabel: "1 MB",
  },
};

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Uploads an admin image directly from the browser to Cloudinary using a
 * short-lived backend signature, bypassing Vercel's 4.5 MB serverless body limit.
 */
export async function uploadAdminImage(
  endpoint: "/admin/uploads/car-image" | "/admin/uploads/logo",
  file: File
): Promise<{ url: string; publicId: string }> {
  const policy = UPLOAD_POLICIES[endpoint];

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw new ApiError(
      400,
      "INVALID_FILE",
      "Format gambar harus JPG, PNG, atau WEBP."
    );
  }

  if (file.size <= 0 || file.size > policy.maxBytes) {
    throw new ApiError(
      400,
      "FILE_TOO_LARGE",
      `Ukuran file maksimal ${policy.maxLabel}.`
    );
  }

  const sig = await apiFetch<UploadSignatureResponse>("/admin/uploads/signature", {
    method: "POST",
    body: JSON.stringify({
      target: policy.target,
      fileSize: file.size,
      mimeType: file.type,
    }),
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);
  formData.append("allowed_formats", sig.allowedFormats);
  if (sig.publicId) {
    formData.append("public_id", sig.publicId);
  }
  if (sig.uploadPreset) {
    formData.append("upload_preset", sig.uploadPreset);
  }

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const uploadPayload = await uploadRes.json().catch(() => null);
  if (!uploadRes.ok || !uploadPayload?.secure_url) {
    throw new ApiError(
      uploadRes.status || 500,
      "UPLOAD_FAILED",
      uploadPayload?.error?.message ?? "Gagal mengunggah gambar ke Cloudinary."
    );
  }

  return {
    url: uploadPayload.secure_url as string,
    publicId: (uploadPayload.public_id as string) ?? "",
  };
}

