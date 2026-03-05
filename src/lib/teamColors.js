// src/lib/teamColors.js
// ✅ Warna resmi tim F1 2026 — Kick Sauber → Audi

export const TEAM_COLORS = {
  "mclaren":       "#FF8000",
  "mercedes":      "#27F4D2",
  "red_bull":      "#3671C6",
  "ferrari":       "#E8002D",
  "williams":      "#64C4FF",
  "racing_bulls":  "#6692FF",
  "aston_martin":  "#358C75",
  "haas":          "#B6BABD",
  "audi":          "#F50537",   // Audi merah
  "kick_sauber":   "#52E252",   // fallback lama
  "alpine":        "#FF87BC",
  "cadillac":      "#BA0C2F",   // Cadillac merah gelap
  "default":       "#6b7280",
};

export function getTeamColor(constructorId = "") {
  const id = constructorId.toLowerCase().replace(/[-\s]/g, "_");
  if (TEAM_COLORS[id]) return TEAM_COLORS[id];
  // partial match
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (id.includes(key) || key.includes(id)) return color;
  }
  return TEAM_COLORS.default;
}

export const NATIONALITY_FLAGS = {
  "Dutch":          "🇳🇱",
  "British":        "🇬🇧",
  "Monegasque":     "🇲🇨",
  "Spanish":        "🇪🇸",
  "Mexican":        "🇲🇽",
  "Finnish":        "🇫🇮",
  "Australian":     "🇦🇺",
  "Canadian":       "🇨🇦",
  "French":         "🇫🇷",
  "German":         "🇩🇪",
  "Japanese":       "🇯🇵",
  "Thai":           "🇹🇭",
  "Italian":        "🇮🇹",
  "American":       "🇺🇸",
  "Brazilian":      "🇧🇷",
  "New Zealander":  "🇳🇿",
  "Chinese":        "🇨🇳",
  "Argentine":      "🇦🇷",
  "Austrian":       "🇦🇹",
  "Danish":         "🇩🇰",
  "Polish":         "🇵🇱",
};

export function getFlag(nationality = "") {
  return NATIONALITY_FLAGS[nationality] || "🏁";
}

export const COUNTRY_FLAGS = {
  "Australia":            "🇦🇺",
  "China":                "🇨🇳",
  "Japan":                "🇯🇵",
  "Bahrain":              "🇧🇭",
  "Saudi Arabia":         "🇸🇦",
  "USA":                  "🇺🇸",
  "United States":        "🇺🇸",
  "Canada":               "🇨🇦",
  "Monaco":               "🇲🇨",
  "Spain":                "🇪🇸",
  "Austria":              "🇦🇹",
  "UK":                   "🇬🇧",
  "United Kingdom":       "🇬🇧",
  "Belgium":              "🇧🇪",
  "Hungary":              "🇭🇺",
  "Netherlands":          "🇳🇱",
  "Italy":                "🇮🇹",
  "Azerbaijan":           "🇦🇿",
  "Singapore":            "🇸🇬",
  "Mexico":               "🇲🇽",
  "Brazil":               "🇧🇷",
  "United Arab Emirates": "🇦🇪",
  "Qatar":                "🇶🇦",
};

export function getCountryFlag(country = "") {
  return COUNTRY_FLAGS[country] || "🏁";
}