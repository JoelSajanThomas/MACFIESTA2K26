export const EMOJI_ICON_MAP = {
  "🌏": "globe",
  "🎤": "mic",
  "📋": "clipboard",
  "💻": "laptop",
  "🎨": "palette",
  "🎵": "music",
  "💃": "dance",
  "🎮": "gamepad",
  "📊": "chart",
  "📚": "book",
  "📷": "camera",
  "⚽": "sports",
  "🛠": "workshop",
  "🏆": "trophy",
  "⭐": "star",
};

export function resolveIconName(value) {
  if (!value) return "sparkles";
  if (EMOJI_ICON_MAP[value]) return EMOJI_ICON_MAP[value];
  return value;
}
