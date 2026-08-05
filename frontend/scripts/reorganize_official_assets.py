"""Move optimized media into public/assets/official/ and remove legacy folders."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
OFFICIAL = ASSETS / "official"

MOVES = [
    ("hero", "hero"),
    ("about", "about"),
    ("guests", "guests"),
    ("gallery", "gallery"),
    ("sponsors", "sponsors"),
    ("rewind", "rewind"),
    ("theme", "theme"),
    ("categories", "categories"),
    ("pages", "pages"),
    ("events", "events"),
]


def main() -> None:
    OFFICIAL.mkdir(parents=True, exist_ok=True)

    for src_name, dest_name in MOVES:
        src_dir = ASSETS / src_name
        dest_dir = OFFICIAL / dest_name
        if not src_dir.exists():
            continue
        dest_dir.mkdir(parents=True, exist_ok=True)
        for file in src_dir.iterdir():
            if file.is_file():
                target = dest_dir / file.name
                if target.exists():
                    target.unlink()
                shutil.move(str(file), str(target))
                print(f"moved {file.name} -> official/{dest_name}/")
        if src_dir.exists() and not any(src_dir.iterdir()):
            src_dir.rmdir()

    # Remove duplicate loose guest png if webp exists in guests/
    loose_guest = OFFICIAL / "guest-akhil-marar.png"
    guest_webp = OFFICIAL / "guests" / "guest-akhil-marar.webp"
    if loose_guest.exists() and guest_webp.exists():
        loose_guest.unlink()
        print("removed duplicate official/guest-akhil-marar.png")

    print("Reorganize complete.")


if __name__ == "__main__":
    main()
