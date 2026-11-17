import tempfile
import unittest
from pathlib import Path

from PIL import Image

from scripts.normalize_car_images import normalize_image


class NormalizeCarImagesTest(unittest.TestCase):
    def test_white_background_source_becomes_white_1600x1000_canvas(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "car.jpg"
            image = Image.new("RGB", (400, 200), (255, 255, 255))
            for x in range(100, 300):
                for y in range(50, 150):
                    image.putpixel((x, y), (10, 20, 30))
            image.save(src, "JPEG")

            out = normalize_image(src)

            with Image.open(out) as result:
                self.assertEqual(result.size, (1600, 1000))
                self.assertEqual(result.mode, "RGB")
                self.assertEqual(result.getpixel((0, 0)), (255, 255, 255))
                self.assertLess(sum(result.getpixel((800, 500))), 200)

    def test_transparent_png_is_flattened_onto_white_canvas(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "car.png"
            image = Image.new("RGBA", (300, 150), (0, 0, 0, 0))
            for x in range(50, 250):
                for y in range(25, 125):
                    image.putpixel((x, y), (200, 30, 40, 255))
            image.save(src, "PNG")

            out = normalize_image(src)

            with Image.open(out) as result:
                self.assertEqual(result.size, (1600, 1000))
                self.assertEqual(result.mode, "RGB")
                self.assertEqual(result.getpixel((0, 0)), (255, 255, 255))
                self.assertGreater(result.getpixel((800, 500))[0], 150)


if __name__ == "__main__":
    unittest.main()
