from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageChops

CANVAS_SIZE = (1600, 1000)
MAX_WIDTH_RATIO = 0.88
MAX_HEIGHT_RATIO = 0.78
PADDING_RATIO = 0.02
DIFF_THRESHOLD = 10

SOURCE_FILES = (
    "Toyota Avanza.jpg",
    "Honda Brio.jpeg",
    "Toyota Hilux.jpg",
    "Toyota Innova Reborn.png",
)


def content_bbox(image: Image.Image) -> tuple[int, int, int, int] | None:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    if alpha.getextrema()[0] < 255:
        return alpha.point(lambda value: 255 if value > 0 else 0).getbbox()

    rgb = rgba.convert("RGB")
    diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, (255, 255, 255)))
    mask = diff.convert("L").point(lambda value: 255 if value > DIFF_THRESHOLD else 0)
    return mask.getbbox()


def padded_bbox(
    bbox: tuple[int, int, int, int], size: tuple[int, int]
) -> tuple[int, int, int, int]:
    left, upper, right, lower = bbox
    pad_x = max(1, round((right - left) * PADDING_RATIO))
    pad_y = max(1, round((lower - upper) * PADDING_RATIO))
    return (
        max(0, left - pad_x),
        max(0, upper - pad_y),
        min(size[0], right + pad_x),
        min(size[1], lower + pad_y),
    )


def normalize_image(src: Path, dst: Path | None = None) -> Path:
    target = dst or src
    with Image.open(src) as original:
        bbox = content_bbox(original)
        if bbox is None:
            raise ValueError(f"Tidak ada isi pada {src.name}")

        crop = original.crop(padded_bbox(bbox, original.size)).convert("RGBA")
        max_width = round(CANVAS_SIZE[0] * MAX_WIDTH_RATIO)
        max_height = round(CANVAS_SIZE[1] * MAX_HEIGHT_RATIO)
        scale = min(max_width / crop.width, max_height / crop.height)
        resized = crop.resize(
            (
                max(1, round(crop.width * scale)),
                max(1, round(crop.height * scale)),
            ),
            Image.Resampling.LANCZOS,
        )

        canvas = Image.new("RGB", CANVAS_SIZE, (255, 255, 255))
        canvas.paste(
            resized,
            (
                (CANVAS_SIZE[0] - resized.width) // 2,
                (CANVAS_SIZE[1] - resized.height) // 2,
            ),
            resized,
        )

        suffix = target.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            canvas.save(target, "JPEG", quality=92)
        elif suffix == ".png":
            canvas.save(target, "PNG")
        else:
            raise ValueError(f"Format tidak didukung: {target.suffix}")

    return target


def main() -> int:
    public_dir = Path(__file__).resolve().parents[1] / "frontend" / "public"
    failures = 0
    for name in SOURCE_FILES:
        path = public_dir / name
        try:
            normalize_image(path)
            print(f"OK   {name}")
        except Exception as exc:  # lapor per file, lanjut ke file berikutnya
            failures += 1
            print(f"FAIL {name}: {exc}", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
