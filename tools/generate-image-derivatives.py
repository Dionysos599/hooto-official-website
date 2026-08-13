#!/usr/bin/env python3
"""Generate reproducible, disposable WebP assets without modifying source images."""

from __future__ import annotations

import json
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError as error:
    raise SystemExit(
        "Pillow is required: python3 -m pip install -r tools/image-requirements.txt"
    ) from error


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_ROOT = ROOT / "assets/generated/images"
MANIFEST = OUTPUT_ROOT / "manifest.json"
SOURCE_GROUPS = {
    "assets/images/project-covers": (640, 1280),
    "assets/images/cultural-ip/gallery": (480, 960),
    "assets/images/art-education/course": (480, 960),
}
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def web_path(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def generate_source(source: Path, widths: tuple[int, ...]) -> dict[str, object]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        source_width, source_height = image.size
        variants = []

        for requested_width in widths:
            width = min(requested_width, source_width)
            if any(item["width"] == width for item in variants):
                continue

            height = round(source_height * width / source_width)
            destination = OUTPUT_ROOT / source.relative_to(ROOT / "assets/images")
            destination = destination.with_name(f"{destination.stem}-{width}w.webp")
            destination.parent.mkdir(parents=True, exist_ok=True)

            resized = image if width == source_width else image.resize(
                (width, height), Image.Resampling.LANCZOS
            )
            if resized.mode not in ("RGB", "RGBA"):
                resized = resized.convert("RGBA" if "transparency" in resized.info else "RGB")
            resized.save(destination, "WEBP", quality=78, method=6)
            variants.append({"src": web_path(destination), "width": width, "height": height})

    return {
        "src": web_path(source),
        "width": source_width,
        "height": source_height,
        "variants": variants,
    }


def main() -> None:
    manifest = {}
    for relative_directory, widths in SOURCE_GROUPS.items():
        directory = ROOT / relative_directory
        for source in sorted(directory.iterdir(), key=lambda item: item.name.casefold()):
            if source.is_file() and source.suffix.lower() in EXTENSIONS:
                manifest[web_path(source)] = generate_source(source, widths)

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {sum(len(item['variants']) for item in manifest.values())} WebP files from {len(manifest)} originals")


if __name__ == "__main__":
    main()
