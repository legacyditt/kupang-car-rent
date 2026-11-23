import { useEffect } from "react";

export const DEFAULT_DOCUMENT_TITLE =
  "Rental Mobil Kupang — Sewa Mobil Lepas Kunci & Dengan Sopir | Aventra Rental";
export const DEFAULT_ROBOTS_META = "index, follow, max-image-preview:large";

interface DocumentMetaOptions {
  title: string;
  robots?: string;
}

/**
 * Menyelaraskan judul tab dan direktif robots meta sesuai route aktif
 * agar halaman privat (admin & ulasan) tidak terindeks mesin pencari.
 */
export function useDocumentMeta({
  title,
  robots = DEFAULT_ROBOTS_META,
}: DocumentMetaOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let robotsEl = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]'
    );
    if (!robotsEl) {
      robotsEl = document.createElement("meta");
      robotsEl.name = "robots";
      document.head.appendChild(robotsEl);
    }
    const prevRobots = robotsEl.content;
    robotsEl.content = robots;

    return () => {
      document.title = prevTitle;
      if (robotsEl) {
        robotsEl.content = prevRobots;
      }
    };
  }, [title, robots]);
}
