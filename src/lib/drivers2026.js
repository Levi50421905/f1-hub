// src/lib/drivers2026.js
// ✅ DATA RESMI F1 2026 — FIA Entry List
// Sumber: The Race (Jan 2026) + Jolpica API driverId format
// PENTING: field `id` harus SAMA PERSIS dengan driverId di Jolpica API
//          karena dipakai untuk fetch profil driver di /api/driver?id=...

export const DRIVERS_2026 = [
  // ── McLAREN ───────────────────────────────────────────────
  {
    id: "norris",       // ✅ Jolpica driverId
    code: "NOR", num: "4",
    firstName: "Lando",       lastName: "Norris",
    nationality: "British",
    team: "mclaren",          teamName: "McLaren",
  },
  {
    id: "piastri",
    code: "PIA", num: "81",
    firstName: "Oscar",       lastName: "Piastri",
    nationality: "Australian",
    team: "mclaren",          teamName: "McLaren",
  },

  // ── MERCEDES ──────────────────────────────────────────────
  {
    id: "russell",
    code: "RUS", num: "63",
    firstName: "George",      lastName: "Russell",
    nationality: "British",
    team: "mercedes",         teamName: "Mercedes",
  },
  {
    id: "antonelli",
    code: "ANT", num: "12",
    firstName: "Andrea Kimi", lastName: "Antonelli",
    nationality: "Italian",
    team: "mercedes",         teamName: "Mercedes",
  },

  // ── RED BULL RACING ───────────────────────────────────────
  {
    id: "max_verstappen",     // ✅ HARUS max_verstappen bukan verstappen (itu bapaknya Jos)
    code: "VER", num: "1",
    firstName: "Max",         lastName: "Verstappen",
    nationality: "Dutch",
    team: "red_bull",         teamName: "Red Bull Racing",
  },
  {
    id: "hadjar",
    code: "HAD", num: "6",
    firstName: "Isack",       lastName: "Hadjar",
    nationality: "French",
    team: "red_bull",         teamName: "Red Bull Racing",
  },

  // ── FERRARI ───────────────────────────────────────────────
  {
    id: "leclerc",
    code: "LEC", num: "16",
    firstName: "Charles",     lastName: "Leclerc",
    nationality: "Monegasque",
    team: "ferrari",          teamName: "Ferrari",
  },
  {
    id: "hamilton",
    code: "HAM", num: "44",
    firstName: "Lewis",       lastName: "Hamilton",
    nationality: "British",
    team: "ferrari",          teamName: "Ferrari",
  },

  // ── WILLIAMS ──────────────────────────────────────────────
  {
    id: "albon",
    code: "ALB", num: "23",
    firstName: "Alexander",   lastName: "Albon",
    nationality: "Thai",
    team: "williams",         teamName: "Williams",
  },
  {
    id: "sainz",
    code: "SAI", num: "55",
    firstName: "Carlos",      lastName: "Sainz",
    nationality: "Spanish",
    team: "williams",         teamName: "Williams",
  },

  // ── RACING BULLS ──────────────────────────────────────────
  {
    id: "lawson",
    code: "LAW", num: "30",
    firstName: "Liam",        lastName: "Lawson",
    nationality: "New Zealander",
    team: "racing_bulls",     teamName: "Racing Bulls",
  },
  {
    id: "lindblad",           // Rookie baru — mungkin belum ada di Jolpica API
    code: "LIN", num: "41",
    firstName: "Arvid",       lastName: "Lindblad",
    nationality: "British",
    team: "racing_bulls",     teamName: "Racing Bulls",
  },

  // ── ASTON MARTIN ──────────────────────────────────────────
  {
    id: "alonso",
    code: "ALO", num: "14",
    firstName: "Fernando",    lastName: "Alonso",
    nationality: "Spanish",
    team: "aston_martin",     teamName: "Aston Martin",
  },
  {
    id: "stroll",
    code: "STR", num: "18",
    firstName: "Lance",       lastName: "Stroll",
    nationality: "Canadian",
    team: "aston_martin",     teamName: "Aston Martin",
  },

  // ── HAAS ──────────────────────────────────────────────────
  {
    id: "ocon",
    code: "OCO", num: "31",
    firstName: "Esteban",     lastName: "Ocon",
    nationality: "French",
    team: "haas",             teamName: "Haas",
  },
  {
    id: "bearman",
    code: "BEA", num: "87",
    firstName: "Oliver",      lastName: "Bearman",
    nationality: "British",
    team: "haas",             teamName: "Haas",
  },

  // ── AUDI (ex Kick Sauber) ─────────────────────────────────
  {
    id: "hulkenberg",
    code: "HUL", num: "27",
    firstName: "Nico",        lastName: "Hülkenberg",
    nationality: "German",
    team: "audi",             teamName: "Audi",
  },
  {
    id: "bortoleto",
    code: "BOR", num: "5",
    firstName: "Gabriel",     lastName: "Bortoleto",
    nationality: "Brazilian",
    team: "audi",             teamName: "Audi",
  },

  // ── ALPINE ────────────────────────────────────────────────
  {
    id: "gasly",
    code: "GAS", num: "10",
    firstName: "Pierre",      lastName: "Gasly",
    nationality: "French",
    team: "alpine",           teamName: "Alpine",
  },
  {
    id: "colapinto",
    code: "COL", num: "43",
    firstName: "Franco",      lastName: "Colapinto",
    nationality: "Argentine",
    team: "alpine",           teamName: "Alpine",
  },

  // ── CADILLAC (Tim Baru) ───────────────────────────────────
  {
    id: "perez",
    code: "PER", num: "11",
    firstName: "Sergio",      lastName: "Pérez",
    nationality: "Mexican",
    team: "cadillac",         teamName: "Cadillac",
  },
  {
    id: "bottas",
    code: "BOT", num: "77",
    firstName: "Valtteri",    lastName: "Bottas",
    nationality: "Finnish",
    team: "cadillac",         teamName: "Cadillac",
  },
];