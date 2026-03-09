// src/lib/teamColors.js
// ✅ Warna resmi tim F1 2026 — Kick Sauber → Audi

export const TEAM_COLORS = {
  "mclaren":       "#FF8000",
  "mercedes":      "#27F4D2",
  "red_bull":      "#3671C6",
  "ferrari":       "#E8002D",
  "williams":      "#64C4FF",
  "racing_bulls":  "#6692FF",
  "rb":            "#6692FF",
  "aston_martin":  "#358C75",
  "haas":          "#B6BABD",
  "audi":          "#F50537",
  "kick_sauber":   "#52E252",
  "alpine":        "#FF87BC",
  "cadillac":      "#BA0C2F",
  "default":       "#6b7280",
};

export function getTeamColor(constructorId = "") {
  const id = constructorId.toLowerCase().replace(/[-\s]/g, "_");
  if (TEAM_COLORS[id]) return TEAM_COLORS[id];
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (id.includes(key) || key.includes(id)) return color;
  }
  return TEAM_COLORS.default;
}

// ISO 2-letter country codes for flagcdn.com
export const NATIONALITY_ISO = {
  "Dutch":          "nl",
  "British":        "gb",
  "Monegasque":     "mc",
  "Spanish":        "es",
  "Mexican":        "mx",
  "Finnish":        "fi",
  "Australian":     "au",
  "Canadian":       "ca",
  "French":         "fr",
  "German":         "de",
  "Japanese":       "jp",
  "Thai":           "th",
  "Italian":        "it",
  "American":       "us",
  "Brazilian":      "br",
  "New Zealander":  "nz",
  "Chinese":        "cn",
  "Argentine":      "ar",
  "Austrian":       "at",
  "Danish":         "dk",
  "Polish":         "pl",
};

export const COUNTRY_ISO = {
  "Australia":            "au",
  "China":                "cn",
  "Japan":                "jp",
  "Bahrain":              "bh",
  "Saudi Arabia":         "sa",
  "USA":                  "us",
  "United States":        "us",
  "Canada":               "ca",
  "Monaco":               "mc",
  "Spain":                "es",
  "Austria":              "at",
  "UK":                   "gb",
  "United Kingdom":       "gb",
  "Belgium":              "be",
  "Hungary":              "hu",
  "Netherlands":          "nl",
  "Italy":                "it",
  "Azerbaijan":           "az",
  "Singapore":            "sg",
  "Mexico":               "mx",
  "Brazil":               "br",
  "United Arab Emirates": "ae",
  "Qatar":                "qa",
};

// Gambar bendera dari flagcdn.com — ukuran w=40 cukup untuk inline
export function getFlagImg(nationality = "", size = 24) {
  const iso = NATIONALITY_ISO[nationality];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}

export function getCountryFlagImg(country = "", size = 24) {
  const iso = COUNTRY_ISO[country];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}

// Fallback emoji (tetap dipakai di tempat yang belum diupdate)
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