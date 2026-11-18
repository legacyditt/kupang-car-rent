import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

/**
 * Registers GSAP ScrollTrigger & React hook once with mobile-resize protection.
 */
export function registerMotionPlugins(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export const MOTION_MEDIA = {
  desktop: "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
  mobile: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
  any: "(prefers-reduced-motion: no-preference)",
} as const;

export const MOTION_EASE = {
  ignition: "power3.out",
  precision: "power2.out",
} as const;

export const TAP_SPRING = {
  scale: 0.97,
  transition: { type: "spring" as const, stiffness: 500, damping: 30 },
};

