import { useGSAP } from "@gsap/react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import {
  ArrowLeft,
  CalendarCheck2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/features/admin-auth/hooks/useAdminAuth";
import { useBusinessProfile } from "@/features/business-profile/hooks/useBusinessProfile";
import {
  MOTION_EASE,
  MOTION_MEDIA,
  registerMotionPlugins,
} from "@/lib/motion";

registerMotionPlugins();

const CONSOLE_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Anti Bentrok Jadwal",
    desc: "Cegah double booking unit secara otomatis sebelum konfirmasi.",
  },
  {
    icon: CalendarCheck2,
    title: "Kalender Unit Real-Time",
    desc: "Pantau status unit dan ketersediaan bulanan dalam satu layar.",
  },
  {
    icon: MessageCircle,
    title: "Terhubung WhatsApp Admin",
    desc: "Sinkronisasi tarif, catatan internal, dan profil bisnis langsung.",
  },
] as const;

/** Halaman login admin dengan logo Aventra dan desain luxury dark console. */
export function AdminLoginPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, login } = useAdminAuth();
  const { profile } = useBusinessProfile();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animasi masuk konsol login saat halaman dimuat (menghormati prefers-reduced-motion).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_MEDIA.any, () => {
        gsap.from("[data-login-shell]", {
          y: 18,
          opacity: 0,
          duration: 0.45,
          ease: MOTION_EASE.precision,
          force3D: true,
          clearProps: "transform,opacity",
        });
        gsap.from("[data-login-stagger]", {
          y: 12,
          opacity: 0,
          duration: 0.38,
          stagger: 0.06,
          delay: 0.1,
          ease: MOTION_EASE.precision,
          force3D: true,
          clearProps: "transform,opacity",
        });
      });
    },
    { scope: containerRef }
  );

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const res = login(identifier, password);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }

    navigate({ to: "/admin", replace: true });
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-obsidian px-4 py-10 text-white"
    >
      {/* Ambient Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Console Shell */}
      <div
        data-login-shell
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-gold/25 bg-carbon/95 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-md"
      >
        {/* Gold Beam */}
        <div
          className="h-1 w-full bg-gradient-to-r from-gold via-gold-light to-gold/30"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          {/* Left Brand & Operational Showcase (Desktop) */}
          <div className="hidden flex-col justify-between border-r border-hairline bg-obsidian/65 p-8 lg:flex">
            <div>
              <div data-login-stagger className="flex items-center gap-3.5">
                <div className="flex h-12 items-center justify-center rounded-xl border border-gold/30 bg-carbon px-3 py-1.5 shadow-[0_0_24px_rgba(245,184,46,0.12)]">
                  <img
                    src={profile.logoPath}
                    alt={profile.name}
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-gold uppercase">
                    Admin Console
                  </p>
                  <p className="font-display text-sm font-bold text-white">
                    {profile.name}
                  </p>
                </div>
              </div>

              <h2
                data-login-stagger
                className="mt-8 font-display text-2xl font-bold leading-snug tracking-tight text-white"
              >
                Kendali Penuh Unit, Tarif &amp; Jadwal Sewa.
              </h2>
              <p
                data-login-stagger
                className="mt-2 text-xs leading-relaxed text-brand-muted"
              >
                {profile.tagline} — ruang operasi internal untuk memastikan
                setiap unit siap jalan tepat waktu.
              </p>

              <div className="mt-7 space-y-3.5">
                {CONSOLE_PILLARS.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      data-login-stagger
                      className="flex items-start gap-3 rounded-xl border border-hairline bg-carbon/70 p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-white">
                          {pillar.title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-brand-muted">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              data-login-stagger
              className="mt-8 border-t border-hairline pt-4 font-mono text-[10px] tracking-wider text-brand-muted uppercase"
            >
              {profile.location}
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-7 sm:p-9">
            {/* Mobile Logo */}
            <div
              data-login-stagger
              className="mb-5 flex items-center gap-3 lg:hidden"
            >
              <div className="flex h-11 items-center justify-center rounded-xl border border-gold/30 bg-obsidian px-3 py-1.5">
                <img
                  src={profile.logoPath}
                  alt={profile.name}
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>

            <div data-login-stagger>
              <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-gold uppercase">
                {profile.name.toUpperCase()} • ADMIN CONSOLE
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Masuk Dashboard.
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">
                Kelola unit, tarif sewa, dan konfirmasi booking Kupang.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div data-login-stagger className="space-y-1.5">
                <Label
                  htmlFor="admin-identifier"
                  className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
                >
                  Email / Username
                </Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
                    aria-hidden="true"
                  />
                  <Input
                    id="admin-identifier"
                    type="text"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@aventrarental.id"
                    className="h-11 border-hairline bg-obsidian pl-10 pr-3.5 text-sm text-white placeholder:text-brand-muted/60 transition-colors focus-visible:border-gold focus-visible:ring-0"
                  />
                </div>
              </div>

              <div data-login-stagger className="space-y-1.5">
                <Label
                  htmlFor="admin-password"
                  className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
                    aria-hidden="true"
                  />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 border-hairline bg-obsidian pl-10 pr-11 text-sm text-white placeholder:text-brand-muted/60 transition-colors focus-visible:border-gold focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-brand-muted transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-400/35 bg-red-400/10 p-2.5 font-mono text-xs text-red-300"
                >
                  {errorMsg}
                </p>
              )}

              <div data-login-stagger className="pt-1">
                <Button
                  type="submit"
                  className="h-11 w-full cursor-pointer bg-gold font-mono text-xs font-bold tracking-wider text-obsidian uppercase shadow-[0_0_24px_rgba(245,184,46,0.22)] transition-all duration-150 hover:bg-gold-light active:scale-[0.99]"
                >
                  Masuk Dashboard →
                </Button>
              </div>
            </form>

            <p
              data-login-stagger
              className="mt-6 border-t border-hairline pt-4 text-center font-mono text-[10px] text-brand-muted"
            >
              Akses terbatas • Tidak tersedia registrasi publik
            </p>
          </div>
        </div>
      </div>

      <Link
        to="/"
        className="relative z-10 mt-6 inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-brand-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Kembali ke Website
      </Link>
    </div>
  );
}
