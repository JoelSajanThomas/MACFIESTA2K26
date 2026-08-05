"""Copy and optimize official MacFiesta media from archived Final Merge (reference only)."""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
# Legacy trees live outside the active repo after hygiene (sibling archive folder).
ARCHIVE = ROOT.parent.parent / "MacFiestaPro-legacy-archive" / "Final Merge"
REF = ARCHIVE / "Final Frontend" / "public"
REF_BACKEND = ARCHIVE / "Final Backend" / "media"
OUT = ROOT / "public" / "assets" / "official"


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_image(src: Path, dest: Path, max_width: int | None = None, quality: int = 82) -> None:
    ensure_dir(dest.parent)
    if not src.exists():
        print(f"SKIP missing: {src}")
        return
    with Image.open(src) as img:
        img = img.convert("RGBA") if dest.suffix.lower() == ".png" and img.mode in ("RGBA", "LA", "P") else img.convert("RGB")
        if max_width and img.width > max_width:
            ratio = max_width / img.width
            img = img.resize((max_width, int(img.height * ratio)), Image.Resampling.LANCZOS)
        if dest.suffix.lower() in (".jpg", ".jpeg"):
            img = img.convert("RGB")
            img.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
        elif dest.suffix.lower() == ".webp":
            img.save(dest, "WEBP", quality=quality, method=6)
        else:
            img.save(dest, optimize=True)


def copy_binary(src: Path, dest: Path) -> None:
    ensure_dir(dest.parent)
    if not src.exists():
        print(f"SKIP missing: {src}")
        return
    shutil.copy2(src, dest)
    print(f"OK {dest.relative_to(ROOT)}")


def main() -> None:
    ensure_dir(OUT)

    # Logo & favicon
    save_image(
        REF / "MACFIESTALOGO2K25_.png",
        OUT / "macfiesta-logo.png",
        max_width=512,
        quality=88,
    )
    save_image(
        REF / "MACFIESTALOGO2K25_.png",
        OUT / "macfiesta-logo-192.png",
        max_width=192,
        quality=88,
    )
    save_image(
        REF / "MACFIESTALOGO2K25_.png",
        OUT / "macfiesta-mark.png",
        max_width=128,
        quality=88,
    )
    # Brand SVG variants (copy PNG as lockup/footer sources)
    for name in ("logo-mark", "logo-lockup", "logo-footer"):
        save_image(
            REF / "MACFIESTALOGO2K25_.png",
            ROOT / "public" / "brand" / f"{name}.png",
            max_width=220 if "lockup" in name else 128,
            quality=88,
        )

    # Hero
    copy_binary(REF / "videos" / "Hero1.mp4", OUT / "hero" / "hero.mp4")
    save_image(REF / "img" / "campus.webp", OUT / "hero" / "hero-poster.webp", max_width=1920, quality=85)

    # About / pages
    save_image(REF / "img" / "aboutimg.png", OUT / "about" / "about.webp", max_width=1400, quality=85)
    save_image(REF / "img" / "logincard.jpg", OUT / "pages" / "login.webp", max_width=1600, quality=85)
    save_image(REF / "img" / "sports.jpg", OUT / "pages" / "schedule.webp", max_width=1600, quality=85)
    save_image(REF / "img" / "history.jpg", OUT / "pages" / "results.webp", max_width=1600, quality=85)
    save_image(REF / "img" / "gallery-5-min.JPG", OUT / "pages" / "gallery-header.webp", max_width=1600, quality=85)
    save_image(REF / "img" / "gallery-1-min.JPG", OUT / "pages" / "sponsors-bg.webp", max_width=1600, quality=85)

    # Gallery
    for i in range(1, 11):
        src = REF / "img" / f"gallery-{i}-min.JPG"
        save_image(src, OUT / "gallery" / f"gallery-{i:02d}.webp", max_width=1200, quality=82)

    # Guest
    save_image(REF / "img" / "guest- (4).jpg", OUT / "guests" / "guest-akhil-marar.webp", max_width=800, quality=85)

    # Theme / retro
    for i in range(1, 16):
        save_image(REF / "img" / f"retro-{i}.jpg", OUT / "theme" / f"retro-{i:02d}.webp", max_width=1200, quality=82)

    # Rewind tiles
    rewind_map = {
        "rewind-music.webp": "retro-6.jpg",
        "rewind-cultural.webp": "gallery-3-min.JPG",
        "rewind-fashion.webp": "retro-4.jpg",
        "rewind-dj-night.webp": "retro-8.jpg",
    }
    for dest_name, src_name in rewind_map.items():
        save_image(REF / "img" / src_name, OUT / "rewind" / dest_name, max_width=900, quality=82)

    # Event posters / category fallbacks
    for i in range(1, 27):
        src = REF / "img" / f"event-{i}.jpg"
        save_image(src, OUT / "events" / f"event-{i:02d}.webp", max_width=900, quality=82)

    category_src = {
        "tech": "event-1.jpg",
        "arts": "event-14.jpg",
        "music": "event-11.jpg",
        "dance": "event-8.jpg",
        "gaming": "event-6.jpg",
        "management": "event-5.jpg",
        "literary": "event-7.jpg",
        "photography": "event-4.jpg",
        "sports": "sports.jpg",
        "workshops": "lab.jpg",
        "cultural": "retro-1.jpg",
        "crowd": "gallery-5-min.JPG",
        "stage": "gallery-1-min.JPG",
        "winners": "gallery-10-min.JPG",
        "general": "campus.webp",
    }
    for cat, src_name in category_src.items():
        save_image(REF / "img" / src_name, OUT / "categories" / f"{cat}.webp", max_width=900, quality=82)

    # Sponsors
    sponsor_files = [
        ("sponsor-macfast.png", REF_BACKEND / "sponsors" / "1.png"),
        ("sponsor-federal.png", REF_BACKEND / "sponsors" / "federal.png"),
        ("sponsor-hdfc.png", REF_BACKEND / "sponsors" / "hdfc.png"),
        ("sponsor-cocacola.png", REF_BACKEND / "sponsors" / "cocacola.png"),
        ("sponsor-02.png", REF_BACKEND / "sponsors" / "2.png"),
        ("sponsor-03.png", REF_BACKEND / "sponsors" / "3.png"),
        ("sponsor-04.png", REF_BACKEND / "sponsors" / "4.png"),
        ("sponsor-05.png", REF_BACKEND / "sponsors" / "5.png"),
        ("sponsor-06.png", REF_BACKEND / "sponsors" / "6.png"),
    ]
    for dest_name, src in sponsor_files:
        save_image(src, OUT / "sponsors" / dest_name, max_width=400, quality=90)

    print("Asset import complete.")


if __name__ == "__main__":
    main()
