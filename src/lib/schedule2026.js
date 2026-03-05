// src/lib/schedule2026.js
// ✅ Jadwal sesi resmi F1 2026 dalam UTC
// Sumber: FIA / Formula1.com official timetable
// Ditampilkan sebagai WIB (UTC+7) di UI
// Dipakai sebagai fallback kalau Jolpica API tidak punya data waktu sesi

export const SCHEDULE_2026 = {
  1: {
    name: "Australian Grand Prix",
    fp1:        { date: "2026-03-06", time: "01:30:00Z" }, // Jum 08:30 WIB
    fp2:        { date: "2026-03-06", time: "05:00:00Z" }, // Jum 12:00 WIB
    fp3:        { date: "2026-03-07", time: "01:30:00Z" }, // Sab 08:30 WIB
    qualifying: { date: "2026-03-07", time: "05:00:00Z" }, // Sab 12:00 WIB
    race:       { date: "2026-03-08", time: "04:00:00Z" }, // Min 11:00 WIB
  },
  2: {
    name: "Chinese Grand Prix",
    sprint: true,
    fp1:        { date: "2026-03-20", time: "03:30:00Z" }, // Jum 10:30 WIB
    fp2:        { date: "2026-03-21", time: "03:30:00Z" }, // Sab Sprint Q 10:30 WIB
    fp3:        { date: "2026-03-21", time: "07:00:00Z" }, // Sab Sprint 14:00 WIB
    qualifying: { date: "2026-03-22", time: "03:00:00Z" }, // Min Quali 10:00 WIB
    race:       { date: "2026-03-23", time: "07:00:00Z" }, // Sen 14:00 WIB
  },
  3: {
    name: "Japanese Grand Prix",
    fp1:        { date: "2026-04-03", time: "02:30:00Z" }, // Jum 09:30 WIB
    fp2:        { date: "2026-04-03", time: "06:00:00Z" }, // Jum 13:00 WIB
    fp3:        { date: "2026-04-04", time: "02:30:00Z" }, // Sab 09:30 WIB
    qualifying: { date: "2026-04-04", time: "06:00:00Z" }, // Sab 13:00 WIB
    race:       { date: "2026-04-05", time: "05:00:00Z" }, // Min 12:00 WIB
  },
  4: {
    name: "Bahrain Grand Prix",
    fp1:        { date: "2026-04-17", time: "11:30:00Z" }, // Jum 18:30 WIB
    fp2:        { date: "2026-04-17", time: "15:00:00Z" }, // Jum 22:00 WIB
    fp3:        { date: "2026-04-18", time: "11:30:00Z" }, // Sab 18:30 WIB
    qualifying: { date: "2026-04-18", time: "15:00:00Z" }, // Sab 22:00 WIB
    race:       { date: "2026-04-19", time: "15:00:00Z" }, // Min 22:00 WIB
  },
  5: {
    name: "Saudi Arabian Grand Prix",
    fp1:        { date: "2026-04-24", time: "13:30:00Z" }, // Jum 20:30 WIB
    fp2:        { date: "2026-04-24", time: "17:00:00Z" }, // Sab 00:00 WIB
    fp3:        { date: "2026-04-25", time: "13:30:00Z" }, // Sab 20:30 WIB
    qualifying: { date: "2026-04-25", time: "17:00:00Z" }, // Min 00:00 WIB
    race:       { date: "2026-04-26", time: "17:00:00Z" }, // Min 00:00 WIB (+1)
  },
  6: {
    name: "Miami Grand Prix",
    sprint: true,
    fp1:        { date: "2026-05-08", time: "18:30:00Z" }, // Jum 01:30 WIB (+1)
    fp2:        { date: "2026-05-09", time: "14:30:00Z" }, // Sab Sprint Q 21:30 WIB
    fp3:        { date: "2026-05-09", time: "18:00:00Z" }, // Sab Sprint 01:00 WIB (+1)
    qualifying: { date: "2026-05-10", time: "14:00:00Z" }, // Min Quali 21:00 WIB
    race:       { date: "2026-05-10", time: "19:00:00Z" }, // Min 02:00 WIB (+1)
  },
  7: {
    name: "Emilia Romagna Grand Prix",
    fp1:        { date: "2026-05-22", time: "11:30:00Z" }, // Jum 18:30 WIB
    fp2:        { date: "2026-05-22", time: "15:00:00Z" }, // Jum 22:00 WIB
    fp3:        { date: "2026-05-23", time: "10:30:00Z" }, // Sab 17:30 WIB
    qualifying: { date: "2026-05-23", time: "14:00:00Z" }, // Sab 21:00 WIB
    race:       { date: "2026-05-24", time: "13:00:00Z" }, // Min 20:00 WIB
  },
  8: {
    name: "Monaco Grand Prix",
    fp1:        { date: "2026-05-28", time: "11:30:00Z" }, // Kam 18:30 WIB
    fp2:        { date: "2026-05-28", time: "15:00:00Z" }, // Kam 22:00 WIB
    fp3:        { date: "2026-05-30", time: "10:30:00Z" }, // Sab 17:30 WIB
    qualifying: { date: "2026-05-30", time: "14:00:00Z" }, // Sab 21:00 WIB
    race:       { date: "2026-05-31", time: "13:00:00Z" }, // Min 20:00 WIB
  },
  9: {
    name: "Spanish Grand Prix",
    fp1:        { date: "2026-06-05", time: "11:30:00Z" }, // Jum 18:30 WIB
    fp2:        { date: "2026-06-05", time: "15:00:00Z" }, // Jum 22:00 WIB
    fp3:        { date: "2026-06-06", time: "10:30:00Z" }, // Sab 17:30 WIB
    qualifying: { date: "2026-06-06", time: "14:00:00Z" }, // Sab 21:00 WIB
    race:       { date: "2026-06-07", time: "13:00:00Z" }, // Min 20:00 WIB
  },
  10: {
    name: "Canadian Grand Prix",
    sprint: true,
    fp1:        { date: "2026-06-12", time: "17:30:00Z" }, // Jum 00:30 WIB (+1)
    fp2:        { date: "2026-06-13", time: "13:30:00Z" }, // Sab Sprint Q 20:30 WIB
    fp3:        { date: "2026-06-13", time: "17:00:00Z" }, // Sab Sprint 00:00 WIB (+1)
    qualifying: { date: "2026-06-14", time: "14:00:00Z" }, // Min Quali 21:00 WIB
    race:       { date: "2026-06-14", time: "18:00:00Z" }, // Min 01:00 WIB (+1)
  },
  11: {
    name: "Austrian Grand Prix",
    fp1:        { date: "2026-06-26", time: "11:30:00Z" },
    fp2:        { date: "2026-06-26", time: "15:00:00Z" },
    fp3:        { date: "2026-06-27", time: "10:30:00Z" },
    qualifying: { date: "2026-06-27", time: "14:00:00Z" },
    race:       { date: "2026-06-28", time: "13:00:00Z" },
  },
  12: {
    name: "British Grand Prix",
    sprint: true,
    fp1:        { date: "2026-07-03", time: "11:30:00Z" },
    fp2:        { date: "2026-07-04", time: "10:30:00Z" },
    fp3:        { date: "2026-07-04", time: "14:30:00Z" },
    qualifying: { date: "2026-07-05", time: "10:00:00Z" },
    race:       { date: "2026-07-05", time: "14:00:00Z" },
  },
  13: {
    name: "Belgian Grand Prix",
    fp1:        { date: "2026-07-24", time: "11:30:00Z" },
    fp2:        { date: "2026-07-24", time: "15:00:00Z" },
    fp3:        { date: "2026-07-25", time: "10:30:00Z" },
    qualifying: { date: "2026-07-25", time: "14:00:00Z" },
    race:       { date: "2026-07-26", time: "13:00:00Z" },
  },
  14: {
    name: "Hungarian Grand Prix",
    fp1:        { date: "2026-07-31", time: "11:30:00Z" },
    fp2:        { date: "2026-07-31", time: "15:00:00Z" },
    fp3:        { date: "2026-08-01", time: "10:30:00Z" },
    qualifying: { date: "2026-08-01", time: "14:00:00Z" },
    race:       { date: "2026-08-02", time: "13:00:00Z" },
  },
  15: {
    name: "Dutch Grand Prix",
    sprint: true,
    fp1:        { date: "2026-08-28", time: "10:30:00Z" },
    fp2:        { date: "2026-08-29", time: "10:30:00Z" },
    fp3:        { date: "2026-08-29", time: "14:30:00Z" },
    qualifying: { date: "2026-08-30", time: "10:00:00Z" },
    race:       { date: "2026-08-30", time: "13:00:00Z" },
  },
  16: {
    name: "Italian Grand Prix",
    fp1:        { date: "2026-09-04", time: "11:30:00Z" },
    fp2:        { date: "2026-09-04", time: "15:00:00Z" },
    fp3:        { date: "2026-09-05", time: "10:30:00Z" },
    qualifying: { date: "2026-09-05", time: "14:00:00Z" },
    race:       { date: "2026-09-06", time: "13:00:00Z" },
  },
  17: {
    name: "Madrid Grand Prix",
    fp1:        { date: "2026-09-11", time: "11:30:00Z" },
    fp2:        { date: "2026-09-11", time: "15:00:00Z" },
    fp3:        { date: "2026-09-12", time: "10:30:00Z" },
    qualifying: { date: "2026-09-12", time: "14:00:00Z" },
    race:       { date: "2026-09-13", time: "13:00:00Z" },
  },
  18: {
    name: "Azerbaijan Grand Prix",
    fp1:        { date: "2026-09-25", time: "09:30:00Z" },
    fp2:        { date: "2026-09-25", time: "13:00:00Z" },
    fp3:        { date: "2026-09-26", time: "08:30:00Z" },
    qualifying: { date: "2026-09-26", time: "12:00:00Z" },
    race:       { date: "2026-09-27", time: "11:00:00Z" },
  },
  19: {
    name: "Singapore Grand Prix",
    fp1:        { date: "2026-10-02", time: "09:30:00Z" },
    fp2:        { date: "2026-10-02", time: "13:00:00Z" },
    fp3:        { date: "2026-10-03", time: "09:30:00Z" },
    qualifying: { date: "2026-10-03", time: "13:00:00Z" },
    race:       { date: "2026-10-04", time: "12:00:00Z" },
  },
  20: {
    name: "United States Grand Prix",
    sprint: true,
    fp1:        { date: "2026-10-16", time: "18:30:00Z" },
    fp2:        { date: "2026-10-17", time: "14:30:00Z" },
    fp3:        { date: "2026-10-17", time: "18:00:00Z" },
    qualifying: { date: "2026-10-18", time: "14:00:00Z" },
    race:       { date: "2026-10-18", time: "19:00:00Z" },
  },
  21: {
    name: "Mexico City Grand Prix",
    fp1:        { date: "2026-10-23", time: "18:30:00Z" },
    fp2:        { date: "2026-10-23", time: "22:00:00Z" },
    fp3:        { date: "2026-10-24", time: "17:30:00Z" },
    qualifying: { date: "2026-10-24", time: "21:00:00Z" },
    race:       { date: "2026-10-25", time: "20:00:00Z" },
  },
  22: {
    name: "São Paulo Grand Prix",
    sprint: true,
    fp1:        { date: "2026-11-06", time: "14:30:00Z" },
    fp2:        { date: "2026-11-07", time: "10:30:00Z" },
    fp3:        { date: "2026-11-07", time: "14:30:00Z" },
    qualifying: { date: "2026-11-08", time: "14:00:00Z" },
    race:       { date: "2026-11-08", time: "17:00:00Z" },
  },
  23: {
    name: "Las Vegas Grand Prix",
    fp1:        { date: "2026-11-19", time: "04:30:00Z" },
    fp2:        { date: "2026-11-19", time: "08:00:00Z" },
    fp3:        { date: "2026-11-20", time: "04:30:00Z" },
    qualifying: { date: "2026-11-20", time: "08:00:00Z" },
    race:       { date: "2026-11-21", time: "06:00:00Z" },
  },
  24: {
    name: "Abu Dhabi Grand Prix",
    fp1:        { date: "2026-12-04", time: "09:30:00Z" },
    fp2:        { date: "2026-12-04", time: "13:00:00Z" },
    fp3:        { date: "2026-12-05", time: "09:30:00Z" },
    qualifying: { date: "2026-12-05", time: "13:00:00Z" },
    race:       { date: "2026-12-06", time: "13:00:00Z" },
  },
};