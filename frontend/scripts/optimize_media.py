"""Recompress MacFiesta public media for smaller size with high visual quality."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(r"C:\Users\JOEL\Desktop\projects\MacFiestaPro\frontend\public\assets\image all")
REF = ROOT / "ref-ui"
OFF = ROOT / "official" / "hero"


def run(cmd: list[str]) -> None:
    print(">", " ".join(cmd))
    subprocess.run(cmd, check=True)


def recompress_mp4(src: Path, crf: int = 24, max_w: int = 1280) -> None:
    if not src.exists():
        return
    tmp = src.with_suffix(".tmp.mp4")
    vf = f"scale='min({max_w},iw)':-2"
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        "-an",
        str(tmp),
    ])
    if tmp.stat().st_size < src.stat().st_size:
        src.unlink()
        tmp.rename(src)
        print(f"  kept smaller mp4: {src.name}")
    else:
        tmp.unlink(missing_ok=True)
        print(f"  kept original mp4: {src.name}")


def recompress_webm(src: Path, crf: int = 34, max_w: int = 1280) -> None:
    if not src.exists():
        return
    tmp = src.with_suffix(".tmp.webm")
    vf = f"scale='min({max_w},iw)':-2"
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-vf", vf,
        "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", str(crf),
        "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
        "-an",
        str(tmp),
    ])
    if tmp.stat().st_size < src.stat().st_size:
        src.unlink()
        tmp.rename(src)
        print(f"  kept smaller webm: {src.name}")
    else:
        tmp.unlink(missing_ok=True)
        print(f"  kept original webm: {src.name}")


def main() -> int:
    pairs = [
        (REF / "macfiesta-official-reel.mp4", REF / "macfiesta-official-reel.webm"),
        (REF / "cinematic-loop.mp4", REF / "cinematic-loop.webm"),
        (REF / "fiesta-promo.mp4", REF / "fiesta-promo.webm"),
        (OFF / "hero-720p.mp4", OFF / "hero-720p.webm"),
        (OFF / "hero-480p.mp4", OFF / "hero-480p.webm"),
    ]
    for mp4, webm in pairs:
        print("====", mp4.name if mp4.exists() else webm.name)
        # Prefer encoding webm from best source (mp4 if present)
        source = mp4 if mp4.exists() else webm
        if not source.exists():
            continue
        # Encode compact webm + mp4 from source
        if mp4.exists() or webm.exists():
            # temp outputs then replace
            out_webm = webm.with_suffix(".new.webm")
            out_mp4 = mp4.with_suffix(".new.mp4") if mp4 else None
            vf = "scale='min(1280,iw)':-2"
            run([
                "ffmpeg", "-y", "-i", str(source),
                "-vf", vf,
                "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34",
                "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
                "-an", str(out_webm),
            ])
            run([
                "ffmpeg", "-y", "-i", str(source),
                "-vf", vf,
                "-c:v", "libx264", "-preset", "slow", "-crf", "24",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                "-an", str(out_mp4),
            ])
            # Replace if smaller or always for consistency after quality encode
            for new, old in ((out_webm, webm), (out_mp4, mp4)):
                if new is None or not new.exists():
                    continue
                if old.exists():
                    before = old.stat().st_size
                    after = new.stat().st_size
                    if after <= before * 1.02:  # allow tiny growth only if needed; prefer smaller
                        old.unlink()
                        new.rename(old)
                        print(f"  {old.name}: {before/1e6:.2f}MB -> {after/1e6:.2f}MB")
                    else:
                        # still replace if original was huge and new is under 4MB improvement threshold
                        if after < before:
                            old.unlink()
                            new.rename(old)
                            print(f"  {old.name}: {before/1e6:.2f}MB -> {after/1e6:.2f}MB")
                        else:
                            new.unlink()
                            print(f"  kept {old.name}")
                else:
                    new.rename(old)
                    print(f"  created {old.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
