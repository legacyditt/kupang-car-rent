import { useGSAP } from "@gsap/react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
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

/** Halaman login admin dengan form terpusat di atas logo Aventra gelap yang disinari cahaya emas bergerak. */
export function AdminLoginPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardBorderRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, login } = useAdminAuth();
  const { profile } = useBusinessProfile();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animasi masuk form + garis emas tipis yang bergerak mengitari border kartu (menghormati prefers-reduced-motion).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_MEDIA.any, () => {
        gsap.from("[data-login-card]", {
          y: 18,
          opacity: 0,
          duration: 0.45,
          ease: MOTION_EASE.precision,
          force3D: true,
          clearProps: "transform,opacity",
        });

        const borderEl = cardBorderRef.current;
        if (!borderEl) return;

        const orbit = { angle: 0 };
        gsap.to(orbit, {
          angle: 360,
          duration: 9,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            borderEl.style.setProperty("--border-angle", `${orbit.angle}deg`);
          },
        });
      });
    },
    { scope: containerRef }
  );

  // Gerakkan cahaya senter dalam 1 jalur bolak-balik melintasi logo Aventra.
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      backdrop.style.setProperty("--gleam-x", "50%");
      backdrop.style.setProperty("--gleam-y", "50%");
      return;
    }

    const sweep = { x: 10, y: 88 };
    const applyCoords = () => {
      backdrop.style.setProperty("--gleam-x", `${sweep.x}%`);
      backdrop.style.setProperty("--gleam-y", `${sweep.y}%`);
    };
    applyCoords();

    const tween = gsap.to(sweep, {
      x: 90,
      y: 12,
      duration: 6.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      onUpdate: applyCoords,
    });

    return () => {
      tween.kill();
    };
  }, []);

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

  const maskStyle: CSSProperties = {
    WebkitMaskImage:
      "radial-gradient(circle 480px at var(--gleam-x, 50%) var(--gleam-y, 50%), #000 0%, rgba(0,0,0,0.8) 48%, rgba(0,0,0,0.28) 76%, transparent 100%)",
    maskImage:
      "radial-gradient(circle 480px at var(--gleam-x, 50%) var(--gleam-y, 50%), #000 0%, rgba(0,0,0,0.8) 48%, rgba(0,0,0,0.28) 76%, transparent 100%)",
  };

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-obsidian px-4 py-10 text-white"
    >
      {/* Darkened Aventra Logo Backdrop + Moving Gold Light */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        style={
          {
            "--gleam-x": "50%",
            "--gleam-y": "50%",
          } as CSSProperties
        }
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
      >
        <div className="relative flex w-[min(96vw,1080px)] items-center justify-center">
          {/* Base darkened logo (mix-blend-screen removes black JPEG background) */}
          <img
            src={profile.logoPath}
            alt=""
            className="w-full max-w-[1040px] object-contain opacity-[0.12] mix-blend-screen contrast-125"
          />

          {/* Illuminated logo revealed only where the flashlight beam passes */}
          <img
            src={profile.logoPath}
            alt=""
            style={maskStyle}
            className="absolute inset-0 m-auto w-full max-w-[1040px] object-contain opacity-95 mix-blend-screen brightness-125 contrast-125"
          />
        </div>

        {/* Moving flashlight beam */}
        <div
          style={{
            left: "var(--gleam-x)",
            top: "var(--gleam-y)",
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className="h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(255,229,153,0.16)_0%,rgba(245,184,46,0.12)_38%,rgba(245,184,46,0.03)_65%,transparent_80%)] blur-2xl" />
        </div>
      </div>

      {/* Centered Login Card with Border-Only Traveling Gold Beam */}
      <div
        data-login-card
        className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl bg-carbon/90 shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
      >
        <div
          ref={cardBorderRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl p-[1px]"
          style={
            {
              "--border-angle": "0deg",
              background:
                "conic-gradient(from var(--border-angle), rgba(255,255,255,0.08) 0deg 300deg, rgba(245,184,46,0.45) 328deg, rgba(255,229,153,0.95) 348deg, rgba(245,184,46,0.35) 356deg, rgba(255,255,255,0.08) 360deg)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
            } as CSSProperties
          }
        />

        <div className="relative overflow-hidden rounded-2xl">
        {/* Gold Beam */}
        <div
          className="h-1 w-full bg-gradient-to-r from-gold via-gold-light to-gold/35"
          aria-hidden="true"
        />

        <div className="p-7 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 items-center justify-center rounded-lg border border-gold/30 bg-obsidian/90 px-2.5 py-1">
              <img
                src={profile.logoPath}
                alt={profile.name}
                className="h-6 w-auto object-contain"
              />
            </div>
            <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-gold uppercase">
              {profile.name.toUpperCase()} • ADMIN CONSOLE
            </p>
          </div>

          <div>
            <h1 className="flex justify-center font-display text-2xl font-bold tracking-tight text-white sm:text-[28px]">
              Login Admin
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">
              Kelola unit, tarif sewa, dan konfirmasi booking Kupang.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
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
                  className="h-11 border-hairline bg-obsidian/65 pl-10 pr-3.5 text-sm text-white placeholder:text-brand-muted/60 transition-colors focus-visible:border-gold focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
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
                  className="h-11 border-hairline bg-obsidian/65 pl-10 pr-11 text-sm text-white placeholder:text-brand-muted/60 transition-colors focus-visible:border-gold focus-visible:ring-0"
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

            <Button
              type="submit"
              className="mt-1 h-11 w-full cursor-pointer bg-gold font-mono text-xs font-bold tracking-wider text-obsidian uppercase shadow-[0_0_24px_rgba(245,184,46,0.22)] transition-all duration-150 hover:bg-gold-light active:scale-[0.99]"
            >
              Masuk Dashboard →
            </Button>
          </form>

          <p className="mt-6 border-t border-hairline pt-4 text-center font-mono text-[10px] text-brand-muted">
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
