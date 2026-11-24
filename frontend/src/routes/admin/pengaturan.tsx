import { CheckCircle2, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoUploadCard } from "@/features/business-profile/components/LogoUploadCard";
import { useBusinessProfile } from "@/features/business-profile/hooks/useBusinessProfile";

export function AdminSettingsPage() {
  const { profile, saveProfile, resetLogo } = useBusinessProfile();

  const [name, setName] = useState(profile.name);
  const [whatsappNumber, setWhatsappNumber] = useState(
    profile.whatsappDisplayIntl
  );
  const [location, setLocation] = useState(profile.location);
  const [operatingHours, setOperatingHours] = useState(profile.operatingHours);
  const [tagline, setTagline] = useState(profile.tagline);
  const [description, setDescription] = useState(profile.description);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setWhatsappNumber(profile.whatsappDisplayIntl);
    setLocation(profile.location);
    setOperatingHours(profile.operatingHours);
    setTagline(profile.tagline);
    setDescription(profile.description);
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSavedToast(false);

    const res = await saveProfile({
      name,
      whatsappNumber,
      location,
      operatingHours,
      tagline,
      description,
      logoPath: profile.logoPath,
    });

    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }

    setSavedToast(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
            Pengaturan Bisnis
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Profil &amp; Kontak Rental.
          </h1>
        </div>

        <Button
          type="submit"
          className="h-10 gap-2 self-start bg-gold font-mono text-xs font-bold tracking-wider text-obsidian uppercase hover:bg-gold-light sm:self-auto"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Simpan Perubahan
        </Button>
      </div>

      {errorMsg && (
        <p className="rounded-xl border border-red-400/35 bg-red-400/10 p-3 font-mono text-xs text-red-300">
          {errorMsg}
        </p>
      )}

      {savedToast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-400/10 p-3 font-mono text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Perubahan tersimpan dan langsung disinkronkan ke Landing Page &amp;
            Sidebar.
          </span>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Informasi Utama & Kontak WhatsApp */}
        <Card className="rounded-2xl border-hairline bg-carbon text-white">
          <CardHeader>
            <CardTitle className="font-display text-base font-bold text-white">
              Informasi Utama &amp; Kontak WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="biz-name"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Nama Bisnis
              </Label>
              <Input
                id="biz-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 border-hairline bg-obsidian text-sm text-white focus-visible:border-gold focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="biz-wa"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Nomor WhatsApp Admin (Tujuan Booking)
              </Label>
              <Input
                id="biz-wa"
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+62 812-3898-9891"
                className="h-10 border-hairline bg-obsidian font-mono text-sm text-gold focus-visible:border-gold focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="biz-location"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Alamat Rental
              </Label>
              <Input
                id="biz-location"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 border-hairline bg-obsidian text-sm text-white focus-visible:border-gold focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="biz-hours"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Jam Operasional
              </Label>
              <Input
                id="biz-hours"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="h-10 border-hairline bg-obsidian text-sm text-white focus-visible:border-gold focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Identitas & Deskripsi */}
        <Card className="rounded-2xl border-hairline bg-carbon text-white">
          <CardHeader>
            <CardTitle className="font-display text-base font-bold text-white">
              Identitas &amp; Deskripsi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LogoUploadCard
              businessName={name || profile.name}
              logoPath={profile.logoPath}
              onLogoChange={async (dataUrl) => {
                setSavedToast(false);
                setErrorMsg(null);
                const res = await saveProfile({
                  name,
                  whatsappNumber,
                  location,
                  operatingHours,
                  tagline,
                  description,
                  logoPath: dataUrl,
                });
                if (!res.ok) {
                  setErrorMsg(res.error);
                  return;
                }
                setSavedToast(true);
              }}
              onResetLogo={async () => {
                setSavedToast(false);
                await resetLogo();
                setSavedToast(true);
              }}
            />

            <div className="space-y-1.5">
              <Label
                htmlFor="biz-tagline"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Tagline
              </Label>
              <Input
                id="biz-tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="h-10 border-hairline bg-obsidian text-sm text-white focus-visible:border-gold focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="biz-desc"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Deskripsi Bisnis
              </Label>
              <textarea
                id="biz-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-hairline bg-obsidian p-3 text-sm text-white placeholder:text-brand-muted/60 focus:border-gold focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

