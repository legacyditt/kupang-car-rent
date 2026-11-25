import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

/**
 * Registers GSAP ScrollTrigger & React hook once for lazy-loaded secondary/admin routes.
 * Kept separate from `@/lib/motion` so mobile initial load does not bundle GSAP.
 */
export function registerMotionPlugins(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}
