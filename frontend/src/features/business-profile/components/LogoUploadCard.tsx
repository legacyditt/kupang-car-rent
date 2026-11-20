import { RotateCcw, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_BUSINESS_PROFILE,
  validateLogoFile,
} from "../utils/business-profile";

interface LogoUploadCardProps {
  businessName: string;
  logoPath: string;
  onLogoChange: (dataUrl: string) => void;
  onResetLogo: () => void;
}

export function LogoUploadCard({
  businessName,
  logoPath,
  onLogoChange,
  onResetLogo,
}: LogoUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const isCustomLogo = logoPath !== DEFAULT_BUSINESS_PROFILE.logoPath;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setLogoError(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validation = validateLogoFile({ type: file.type, size: file.size });
    if (!validation.ok) {
      setLogoError(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onLogoChange(reader.result);
      }
    };
    reader.onerror = () => {
      setLogoError("Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-obsidian p-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-4 text-left transition-opacity hover:opacity-85"
        >
          <img
            src={logoPath}
            alt={businessName}
            className="h-14 w-auto max-w-[140px] rounded-md object-contain"
          />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-white uppercase">
              {businessName}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[10px] text-gold">
              <Upload className="h-3 w-3" aria-hidden="true" />
              Klik untuk ganti logo (.png / .jpg / .webp, maks 1MB)
            </p>
          </div>
        </button>

        {isCustomLogo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLogoError(null);
              onResetLogo();
            }}
            className="h-8 gap-1.5 self-start border-hairline bg-carbon font-mono text-[10px] text-brand-muted hover:text-white sm:self-auto"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Reset Default
          </Button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {logoError && (
        <p className="font-mono text-[11px] text-red-400">{logoError}</p>
      )}
    </div>
  );
}
