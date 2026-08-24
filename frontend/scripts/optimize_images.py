"""Lossless/near-lossless image size pass for public assets."""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.path.insert(0, r"C:\Users\JOEL\Desktop\projects\MacFiestaPro\backend\.venv\Lib\site-packages")
    from PIL import Image

ROOT = Path(r"C:\Users\JOEL\Desktop\projects\MacFiestaPro\frontend\public\assets\image all")


def optimize_pngs() -> float:
    saved = 0.0
    for path in ROOT.rglob("*.png"):
        if path.stat().st_size < 50_000:
            continue
        img = Image.open(path)
        tmp = path.with_suffix(".opt.png")
        img.save(tmp, format="PNG", optimize=True, compress_level=9)
        old, new = path.stat().st_size, tmp.stat().st_size
        if new < old * 0.98:
            path.unlink()
            tmp.rename(path)
            saved += old - new
            print(f"{path.name}: {old / 1e6:.2f}MB -> {new / 1e6:.2f}MB")
        else:
            tmp.unlink(missing_ok=True)
    return saved


def optimize_webps(quality: int = 82) -> float:
    saved = 0.0
    for path in ROOT.rglob("*.webp"):
        if path.stat().st_size < 80_000:
            continue
        img = Image.open(path)
        tmp = path.with_suffix(".opt.webp")
        img.save(tmp, format="WEBP", quality=quality, method=6)
        old, new = path.stat().st_size, tmp.stat().st_size
        if new < old * 0.95:
            path.unlink()
            tmp.rename(path)
            saved += old - new
            print(f"{path.name}: {old / 1e6:.2f}MB -> {new / 1e6:.2f}MB")
        else:
            tmp.unlink(missing_ok=True)
    return saved


def main() -> int:
    png = optimize_pngs()
    webp = optimize_webps()
    print(f"PNG saved {png / 1e6:.2f}MB")
    print(f"WEBP saved {webp / 1e6:.2f}MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
