import { useEffect, type DependencyList, type RefObject } from "react";

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

/**
 * Dynamically imports GSAP + ScrollTrigger ONLY on desktop viewports with motion enabled.
 * Mobile devices never download or parse the GSAP bundle on initial page load.
 */
export function useDesktopGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (gsapInstance: typeof import("gsap").default) => void | (() => void),
  deps: DependencyList = []
): void {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia(MOTION_MEDIA.desktop).matches
    ) {
      return;
    }

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let customCleanup: void | (() => void);

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapMod, scrollTriggerMod]) => {
      if (cancelled || !scope.current) return;
      const gsap = gsapMod.default;
      gsap.registerPlugin(scrollTriggerMod.ScrollTrigger);
      scrollTriggerMod.ScrollTrigger.config({ ignoreMobileResize: true });

      ctx = gsap.context(() => {
        customCleanup = setup(gsap);
      }, scope);
    });

    return () => {
      cancelled = true;
      if (typeof customCleanup === "function") customCleanup();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
