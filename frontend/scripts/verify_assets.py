from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
assets_text = (root / "src/utils/assets.js").read_text(encoding="utf-8")
brand_text = (root / "src/utils/brand.js").read_text(encoding="utf-8")

paths = set(re.findall(r'["\'](/assets/official/[^"\']+)["\']', brand_text))
paths.update(f"/assets/official/{m}" for m in re.findall(r'O\("([^"]+)"\)', assets_text))

missing = [p for p in sorted(paths) if not (root / "public" / p.lstrip("/")).exists()]
print(f"Referenced: {len(paths)}")
print(f"Missing: {len(missing)}")
for m in missing:
    print(f"  MISSING {m}")
if not missing:
    print("All referenced assets present.")
