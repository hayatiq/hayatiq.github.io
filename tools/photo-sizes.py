#!/usr/bin/env python3
"""Smaller copies of the product photos.

Every photo in images/ (up to ~1,100px wide) also needs:
  images/cards/<name>  600px wide: product cards, thumbnails, cart rows (cardImage())
  images/md/<name>     800px wide: the product page's main photo on phones (pagePhoto())
Both in js/script.js. Wider screens and the full-size viewer load images/<name> itself.

Run it after adding or replacing product photos (needs Pillow: pip install pillow):
    python3 tools/photo-sizes.py
It makes every images/md/ copy again, and only the card copies that are missing (the
existing ones were made by hand). Then run tools/og-images.py for link previews.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images"
SIZES = {"cards": 600, "md": 800}
SKIP = {"logo.webp", "logo-small.webp"}


def copy(src: Path, out: Path, width: int) -> None:
    photo = Image.open(src)
    if photo.width > width:
        photo = photo.resize((width, round(photo.height * width / photo.width)), Image.LANCZOS)
    photo.save(out, "WEBP", quality=80, method=6)
    if out.stat().st_size >= src.stat().st_size:  # no smaller: use the photo as it is
        out.write_bytes(src.read_bytes())
    print(f"{out.relative_to(ROOT)}  {photo.width}px  {out.stat().st_size // 1024} KB (full {src.stat().st_size // 1024} KB)")


def main() -> None:
    for folder, width in SIZES.items():
        (SRC / folder).mkdir(exist_ok=True)
        for src in sorted(SRC.glob("*.webp")):
            out = SRC / folder / src.name
            if src.name in SKIP or (folder == "cards" and out.exists()):
                continue
            copy(src, out, width)


if __name__ == "__main__":
    main()
