import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/lib/constants";

/**
 * Deterministic scroll-spy hook shared by desktop Navbar and mobile bottom dock.
 */
export function useActiveSection() {
  const clickLockUntilRef = useRef(0);
  const [activeHref, setActiveHref] = useState<string>(NAV_LINKS[0].href);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleNavClick = useCallback((href: string) => {
    clickLockUntilRef.current = performance.now() + 700;
    setActiveHref(href);
  }, []);

  useEffect(() => {
    let rafId = 0;

    const updateOnScroll = () => {
      rafId = 0;
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 24);

      if (performance.now() < clickLockUntilRef.current) return;

      if (scrollY < 40) {
        setActiveHref(NAV_LINKS[0].href);
        return;
      }

      const sections = NAV_LINKS.map((link) => ({
        href: link.href,
        el: document.getElementById(link.href.slice(1)),
      })).filter(
        (item): item is { href: (typeof NAV_LINKS)[number]["href"]; el: HTMLElement } =>
          item.el !== null
      );

      if (sections.length === 0) return;

      if (
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 24
      ) {
        setActiveHref(sections[sections.length - 1].href);
        return;
      }

      const offset = 140;
      let current: string = sections[0].href;
      for (const sec of sections) {
        if (sec.el.getBoundingClientRect().top <= offset) {
          current = sec.href;
        }
      }
      setActiveHref(current);
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateOnScroll);
      }
    };

    const onScrollEnd = () => {
      clickLockUntilRef.current = 0;
      updateOnScroll();
    };

    updateOnScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScrollEnd, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return { activeHref, isScrolled, handleNavClick };
}
