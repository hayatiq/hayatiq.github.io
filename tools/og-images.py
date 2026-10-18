#!/usr/bin/env python3
"""Link-preview pictures for Facebook, Messenger and WhatsApp.

Makes a 1200x630 JPEG (the shape Facebook shows) for every photo in images/: the
photo centred on a blurred, enlarged copy of itself. Saved as images/og/<name>.jpg,
plus images/og/brand.jpg (the logo) for products without a real photo;
tools/product-pages.js uses them for each product's preview, and falls back to the
WebP photo itself when a JPEG is missing.

Run it after adding or replacing product photos (needs Pillow: pip install pillow):
    python3 tools/og-images.py
"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images"
OUT = SRC / "og"
SIZE = (1200, 630)
SKIP = {"logo.webp", "logo-small.webp", "placeholder.webp"}


def preview(photo: Image.Image) -> Image.Image:
    w, h = SIZE
    photo = photo.convert("RGB")
    # Background: the photo enlarged to cover the frame, blurred and softened.
    scale = max(w / photo.width, h / photo.height)
    bg = photo.resize((round(photo.width * scale), round(photo.height * scale)), Image.LANCZOS)
    left, top = (bg.width - w) // 2, (bg.height - h) // 2
    bg = bg.crop((left, top, left + w, top + h)).filter(ImageFilter.GaussianBlur(28))
    bg = Image.blend(bg, Image.new("RGB", SIZE, (250, 248, 244)), 0.25)
    # Foreground: the whole photo, fitted to the frame height with a small margin.
    fit = min((w - 80) / photo.width, (h - 40) / photo.height)
    fg = photo.resize((round(photo.width * fit), round(photo.height * fit)), Image.LANCZOS)
    bg.paste(fg, ((w - fg.width) // 2, (h - fg.height) // 2))
    return bg


def brand_card() -> Image.Image:
    """For products without a real photo yet: the logo on its own cream background."""
    logo = Image.open(SRC / "logo.webp").convert("RGBA")
    card = Image.new("RGB", SIZE, logo.convert("RGB").getpixel((5, 5)))
    logo.thumbnail((560, 560), Image.LANCZOS)
    card.paste(logo, ((SIZE[0] - logo.width) // 2, (SIZE[1] - logo.height) // 2), logo)
    return card


def main() -> None:
    OUT.mkdir(exist_ok=True)
    brand_card().save(OUT / "brand.jpg", "JPEG", quality=85, optimize=True)
    for src in sorted(SRC.glob("*.webp")):
        if src.name in SKIP:
            continue
        out = OUT / f"{src.stem}.jpg"
        preview(Image.open(src)).save(out, "JPEG", quality=82, optimize=True, progressive=True)
        print(f"{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
