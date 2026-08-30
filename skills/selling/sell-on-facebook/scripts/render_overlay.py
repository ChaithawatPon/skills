#!/usr/bin/env python3
"""Composite a Thai price/info banner onto a product JPEG. No network."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Thonburi.ttc",
    "/System/Library/Fonts/Thonburi.ttc",
    "/System/Library/Fonts/Supplemental/Ayuthaya.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def render(src: Path, dest: Path, price_line: str, meta_line: str) -> None:
    image = Image.open(src).convert("RGB")
    width, height = image.size
    banner_h = max(int(height * 0.16), 96)
    canvas = Image.new("RGB", (width, height + banner_h), (18, 18, 18))
    canvas.paste(image, (0, 0))

    draw = ImageDraw.Draw(canvas)
    price_font = load_font(max(int(banner_h * 0.42), 28))
    meta_font = load_font(max(int(banner_h * 0.22), 16))
    pad = int(width * 0.04)
    top = height + int(banner_h * 0.18)
    draw.text((pad, top), price_line, font=price_font, fill=(255, 255, 255))
    draw.text((pad, top + int(banner_h * 0.48)), meta_line, font=meta_font, fill=(220, 220, 220))
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, format="PNG", optimize=True)


def main() -> int:
    if len(sys.argv) != 5:
        print("usage: render_overlay.py <src.jpg> <dest.png> <price-line> <meta-line>", file=sys.stderr)
        return 2
    _, src, dest, price_line, meta_line = sys.argv
    render(Path(src), Path(dest), price_line, meta_line)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
