from pathlib import Path

base = Path(__file__).resolve().parents[1] / "public" / "assets" / "original" / "heroes"
base.mkdir(parents=True, exist_ok=True)

heroes = [
    ("crimson-forge", "#e11d2e", "#f0c14b", "Forge"),
    ("ember-pulse", "#ff4d5a", "#f59e0b", "Ember"),
    ("solar-vanguard", "#e11d2e", "#ffd666", "Solar"),
    ("velocity-arc", "#ff4d5a", "#f0c14b", "Arc"),
    ("inferno-beat", "#a10f1c", "#f0c14b", "Beat"),
    ("azure-circuit", "#1e6bff", "#22d3ee", "Circuit"),
    ("thunder-crest", "#4d8cff", "#f0c14b", "Thunder"),
    ("frost-sentinel", "#1e6bff", "#c8d0dc", "Frost"),
    ("neon-phantom", "#7c3aed", "#22d3ee", "Neon"),
    ("lunar-echo", "#4d8cff", "#c8d0dc", "Lunar"),
]

for slug, c1, c2, label in heroes:
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" role="img" aria-label="{label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="280" fill="#05060c"/>
  <rect x="8" y="8" width="184" height="264" fill="none" stroke="url(#g)" stroke-width="3"/>
  <ellipse cx="100" cy="78" rx="28" ry="32" fill="url(#g)" opacity="0.9"/>
  <path d="M70 120 Q100 105 130 120 L145 220 Q100 245 55 220 Z" fill="url(#g)" opacity="0.85"/>
  <path d="M55 130 L35 170 L60 165" fill="{c1}" opacity="0.7"/>
  <path d="M145 130 L165 170 L140 165" fill="{c2}" opacity="0.7"/>
  <circle cx="100" cy="150" r="18" fill="none" stroke="{c2}" stroke-width="2" opacity="0.8"/>
  <text x="100" y="262" text-anchor="middle" fill="#c8d0dc" font-family="sans-serif" font-size="11" letter-spacing="1">{label.upper()}</text>
</svg>
"""
    (base / f"{slug}.svg").write_text(svg, encoding="utf-8")

print(f"wrote {len(heroes)} hero silhouettes to {base}")
