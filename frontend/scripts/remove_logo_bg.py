from PIL import Image
from pathlib import Path

paths = [
    Path(r"C:\Users\JOEL\Desktop\projects\MacFiestaPro\frontend\public\assets\image all\ref-ui\macfiesta-logo.png"),
    Path(r"C:\Users\JOEL\Desktop\projects\MacFiestaPro\frontend\public\assets\image all\official\macfiesta-logo.png"),
    Path(r"C:\Users\JOEL\Desktop\projects\MacFiestaPro\frontend\public\assets\image all\official\macfiesta-mark.png"),
    Path(r"C:\Users\JOEL\Desktop\projects\MacFiestaPro\frontend\public\assets\image all\official\macfiesta-logo-192.png"),
]

src = paths[0]
im = Image.open(src).convert("RGBA")
pix = im.load()
w, h = im.size

THRESHOLD = 32
SOFTNESS = 22

for y in range(h):
    for x in range(w):
        r, g, b, a = pix[x, y]
        m = max(r, g, b)
        warm = (r >= g >= b) and ((r - b) >= 12) and r >= 40
        if warm:
            continue
        if m <= THRESHOLD:
            pix[x, y] = (r, g, b, 0)
        elif m < THRESHOLD + SOFTNESS:
            fade = (m - THRESHOLD) / SOFTNESS
            pix[x, y] = (r, g, b, max(0, min(255, int(a * fade))))

bbox = im.getbbox()
if bbox:
    pad = 8
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(w, bbox[2] + pad)
    bottom = min(h, bbox[3] + pad)
    im = im.crop((left, top, right, bottom))

for p in paths:
    im.save(p, "PNG")
    print("saved", p)

alias = src.with_name("macfiesta-logo-transparent.png")
im.save(alias, "PNG")
print("alias", alias)

sample = Image.open(paths[0]).convert("RGBA")
sp = sample.load()
print("size", sample.size)
print("corner", sp[0, 0])
print("center", sp[sample.width // 2, sample.height // 2])
