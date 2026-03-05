// src/lib/schedule2026.js
// ✅ Waktu SUDAH DIVERIFIKASI dari Formula1.com, ESPN, RacingNews365
// Semua waktu dalam UTC → tampil otomatis dalam WIB (UTC+7) di app
//
// WIB = UTC + 7 jam
// Contoh: Race Australia 04:00 UTC = 11:00 WIB ✅
//
// Sprint weekend: fp2 = Sprint Qualifying, fp3 = Sprint Race

export const SCHEDULE_2026 = {

  // ── R1 AUSTRALIA · AEDT = UTC+11 ─────────────────────────
  // FP1:   Jum 06/03 01:30 UTC → 08:30 WIB
  // FP2:   Jum 06/03 05:00 UTC → 12:00 WIB
  // FP3:   Sab 07/03 01:30 UTC → 08:30 WIB
  // Quali: Sab 07/03 05:00 UTC → 12:00 WIB
  // Race:  Min 08/03 04:00 UTC → 11:00 WIB ✅
  1: {
    fp1:        { date: "2026-03-06", time: "01:30:00Z" },
    fp2:        { date: "2026-03-06", time: "05:00:00Z" },
    fp3:        { date: "2026-03-07", time: "01:30:00Z" },
    qualifying: { date: "2026-03-07", time: "05:00:00Z" },
    race:       { date: "2026-03-08", time: "04:00:00Z" },
  },

  // ── R2 CHINA SPRINT · CST = UTC+8 ────────────────────────
  // FP1:      Jum 13/03 03:30 UTC → 10:30 WIB
  // Sprint Q: Jum 13/03 07:30 UTC → 14:30 WIB
  // Sprint:   Sab 14/03 03:00 UTC → 10:00 WIB
  // Quali:    Sab 14/03 07:00 UTC → 14:00 WIB
  // Race:     Min 15/03 07:00 UTC → 14:00 WIB
  2: {
    sprint: true,
    fp1:        { date: "2026-03-13", time: "03:30:00Z" },
    fp2:        { date: "2026-03-13", time: "07:30:00Z" },
    fp3:        { date: "2026-03-14", time: "03:00:00Z" },
    qualifying: { date: "2026-03-14", time: "07:00:00Z" },
    race:       { date: "2026-03-15", time: "07:00:00Z" },
  },

  // ── R3 JAPAN · JST = UTC+9 ───────────────────────────────
  // FP1:   Jum 27/03 02:30 UTC → 09:30 WIB
  // FP2:   Jum 27/03 06:00 UTC → 13:00 WIB
  // FP3:   Sab 28/03 02:30 UTC → 09:30 WIB
  // Quali: Sab 28/03 06:00 UTC → 13:00 WIB
  // Race:  Min 29/03 05:00 UTC → 12:00 WIB
  3: {
    fp1:        { date: "2026-03-27", time: "02:30:00Z" },
    fp2:        { date: "2026-03-27", time: "06:00:00Z" },
    fp3:        { date: "2026-03-28", time: "02:30:00Z" },
    qualifying: { date: "2026-03-28", time: "06:00:00Z" },
    race:       { date: "2026-03-29", time: "05:00:00Z" },
  },

  // ── R4 BAHRAIN · AST = UTC+3 ─────────────────────────────
  // FP1:   Jum 10/04 11:30 UTC → 18:30 WIB
  // FP2:   Jum 10/04 15:00 UTC → 22:00 WIB
  // FP3:   Sab 11/04 11:30 UTC → 18:30 WIB
  // Quali: Sab 11/04 15:00 UTC → 22:00 WIB
  // Race:  Min 12/04 15:00 UTC → 22:00 WIB
  4: {
    fp1:        { date: "2026-04-10", time: "11:30:00Z" },
    fp2:        { date: "2026-04-10", time: "15:00:00Z" },
    fp3:        { date: "2026-04-11", time: "11:30:00Z" },
    qualifying: { date: "2026-04-11", time: "15:00:00Z" },
    race:       { date: "2026-04-12", time: "15:00:00Z" },
  },

  // ── R5 SAUDI ARABIA · AST = UTC+3 ────────────────────────
  // FP1:   Jum 17/04 13:30 UTC → 20:30 WIB
  // FP2:   Jum 17/04 17:00 UTC → 00:00 WIB (Sabtu dini hari)
  // FP3:   Sab 18/04 13:30 UTC → 20:30 WIB
  // Quali: Sab 18/04 17:00 UTC → 00:00 WIB (Minggu dini hari)
  // Race:  Min 19/04 17:00 UTC → 00:00 WIB (Senin dini hari)
  5: {
    fp1:        { date: "2026-04-17", time: "13:30:00Z" },
    fp2:        { date: "2026-04-17", time: "17:00:00Z" },
    fp3:        { date: "2026-04-18", time: "13:30:00Z" },
    qualifying: { date: "2026-04-18", time: "17:00:00Z" },
    race:       { date: "2026-04-19", time: "17:00:00Z" },
  },

  // ── R6 MIAMI SPRINT · EDT = UTC-4 ────────────────────────
  // FP1:      Jum 01/05 17:30 UTC → 00:30 WIB (Sabtu dini hari)
  // Sprint Q: Jum 01/05 21:30 UTC → 04:30 WIB (Sabtu dini hari)
  // Sprint:   Sab 02/05 17:00 UTC → 00:00 WIB (Minggu dini hari)
  // Quali:    Sab 02/05 21:00 UTC → 04:00 WIB (Minggu dini hari)
  // Race:     Min 03/05 19:00 UTC → 02:00 WIB (Senin dini hari)
  6: {
    sprint: true,
    fp1:        { date: "2026-05-01", time: "17:30:00Z" },
    fp2:        { date: "2026-05-01", time: "21:30:00Z" },
    fp3:        { date: "2026-05-02", time: "17:00:00Z" },
    qualifying: { date: "2026-05-02", time: "21:00:00Z" },
    race:       { date: "2026-05-03", time: "19:00:00Z" },
  },

  // ── R7 CANADA SPRINT · EDT = UTC-4 ───────────────────────
  // FP1:      Jum 22/05 17:30 UTC → 00:30 WIB (Sabtu)
  // Sprint Q: Jum 22/05 21:30 UTC → 04:30 WIB (Sabtu)
  // Sprint:   Sab 23/05 17:00 UTC → 00:00 WIB (Minggu)
  // Quali:    Sab 23/05 21:00 UTC → 04:00 WIB (Minggu)
  // Race:     Min 24/05 18:00 UTC → 01:00 WIB (Senin)
  7: {
    sprint: true,
    fp1:        { date: "2026-05-22", time: "17:30:00Z" },
    fp2:        { date: "2026-05-22", time: "21:30:00Z" },
    fp3:        { date: "2026-05-23", time: "17:00:00Z" },
    qualifying: { date: "2026-05-23", time: "21:00:00Z" },
    race:       { date: "2026-05-24", time: "18:00:00Z" },
  },

  // ── R8 MONACO · CEST = UTC+2 ─────────────────────────────
  // FP1:   Kam 04/06 11:30 UTC → 18:30 WIB
  // FP2:   Kam 04/06 15:00 UTC → 22:00 WIB
  // FP3:   Sab 06/06 10:30 UTC → 17:30 WIB
  // Quali: Sab 06/06 14:00 UTC → 21:00 WIB
  // Race:  Min 07/06 13:00 UTC → 20:00 WIB
  8: {
    fp1:        { date: "2026-06-04", time: "11:30:00Z" },
    fp2:        { date: "2026-06-04", time: "15:00:00Z" },
    fp3:        { date: "2026-06-06", time: "10:30:00Z" },
    qualifying: { date: "2026-06-06", time: "14:00:00Z" },
    race:       { date: "2026-06-07", time: "13:00:00Z" },
  },

  // ── R9 SPAIN (BARCELONA) · CEST = UTC+2 ──────────────────
  // FP1:   Jum 12/06 11:30 UTC → 18:30 WIB
  // FP2:   Jum 12/06 15:00 UTC → 22:00 WIB
  // FP3:   Sab 13/06 10:30 UTC → 17:30 WIB
  // Quali: Sab 13/06 14:00 UTC → 21:00 WIB
  // Race:  Min 14/06 13:00 UTC → 20:00 WIB
  9: {
    fp1:        { date: "2026-06-12", time: "11:30:00Z" },
    fp2:        { date: "2026-06-12", time: "15:00:00Z" },
    fp3:        { date: "2026-06-13", time: "10:30:00Z" },
    qualifying: { date: "2026-06-13", time: "14:00:00Z" },
    race:       { date: "2026-06-14", time: "13:00:00Z" },
  },

  // ── R10 AUSTRIA · CEST = UTC+2 ───────────────────────────
  // FP1:   Jum 26/06 11:30 UTC → 18:30 WIB
  // FP2:   Jum 26/06 15:00 UTC → 22:00 WIB
  // FP3:   Sab 27/06 10:30 UTC → 17:30 WIB
  // Quali: Sab 27/06 14:00 UTC → 21:00 WIB
  // Race:  Min 28/06 13:00 UTC → 20:00 WIB
  10: {
    fp1:        { date: "2026-06-26", time: "11:30:00Z" },
    fp2:        { date: "2026-06-26", time: "15:00:00Z" },
    fp3:        { date: "2026-06-27", time: "10:30:00Z" },
    qualifying: { date: "2026-06-27", time: "14:00:00Z" },
    race:       { date: "2026-06-28", time: "13:00:00Z" },
  },

  // ── R11 GREAT BRITAIN SPRINT · BST = UTC+1 ───────────────
  // FP1:      Jum 03/07 11:30 UTC → 18:30 WIB
  // Sprint Q: Jum 03/07 15:30 UTC → 22:30 WIB
  // Sprint:   Sab 04/07 11:00 UTC → 18:00 WIB
  // Quali:    Sab 04/07 15:00 UTC → 22:00 WIB
  // Race:     Min 05/07 14:00 UTC → 21:00 WIB
  11: {
    sprint: true,
    fp1:        { date: "2026-07-03", time: "11:30:00Z" },
    fp2:        { date: "2026-07-03", time: "15:30:00Z" },
    fp3:        { date: "2026-07-04", time: "11:00:00Z" },
    qualifying: { date: "2026-07-04", time: "15:00:00Z" },
    race:       { date: "2026-07-05", time: "14:00:00Z" },
  },

  // ── R12 BELGIUM · CEST = UTC+2 ───────────────────────────
  // FP1:   Jum 17/07 11:30 UTC → 18:30 WIB
  // FP2:   Jum 17/07 15:00 UTC → 22:00 WIB
  // FP3:   Sab 18/07 10:30 UTC → 17:30 WIB
  // Quali: Sab 18/07 14:00 UTC → 21:00 WIB
  // Race:  Min 19/07 13:00 UTC → 20:00 WIB
  12: {
    fp1:        { date: "2026-07-17", time: "11:30:00Z" },
    fp2:        { date: "2026-07-17", time: "15:00:00Z" },
    fp3:        { date: "2026-07-18", time: "10:30:00Z" },
    qualifying: { date: "2026-07-18", time: "14:00:00Z" },
    race:       { date: "2026-07-19", time: "13:00:00Z" },
  },

  // ── R13 HUNGARY · CEST = UTC+2 ───────────────────────────
  // FP1:   Jum 24/07 11:30 UTC → 18:30 WIB
  // FP2:   Jum 24/07 15:00 UTC → 22:00 WIB
  // FP3:   Sab 25/07 10:30 UTC → 17:30 WIB
  // Quali: Sab 25/07 14:00 UTC → 21:00 WIB
  // Race:  Min 26/07 13:00 UTC → 20:00 WIB
  13: {
    fp1:        { date: "2026-07-24", time: "11:30:00Z" },
    fp2:        { date: "2026-07-24", time: "15:00:00Z" },
    fp3:        { date: "2026-07-25", time: "10:30:00Z" },
    qualifying: { date: "2026-07-25", time: "14:00:00Z" },
    race:       { date: "2026-07-26", time: "13:00:00Z" },
  },

  // ── R14 NETHERLANDS SPRINT · CEST = UTC+2 ────────────────
  // FP1:      Jum 21/08 10:30 UTC → 17:30 WIB
  // Sprint Q: Jum 21/08 14:30 UTC → 21:30 WIB
  // Sprint:   Sab 22/08 10:00 UTC → 17:00 WIB
  // Quali:    Sab 22/08 14:00 UTC → 21:00 WIB
  // Race:     Min 23/08 13:00 UTC → 20:00 WIB
  14: {
    sprint: true,
    fp1:        { date: "2026-08-21", time: "10:30:00Z" },
    fp2:        { date: "2026-08-21", time: "14:30:00Z" },
    fp3:        { date: "2026-08-22", time: "10:00:00Z" },
    qualifying: { date: "2026-08-22", time: "14:00:00Z" },
    race:       { date: "2026-08-23", time: "13:00:00Z" },
  },

  // ── R15 ITALY (MONZA) · CEST = UTC+2 ─────────────────────
  // FP1:   Jum 04/09 11:30 UTC → 18:30 WIB
  // FP2:   Jum 04/09 15:00 UTC → 22:00 WIB
  // FP3:   Sab 05/09 10:30 UTC → 17:30 WIB
  // Quali: Sab 05/09 14:00 UTC → 21:00 WIB
  // Race:  Min 06/09 13:00 UTC → 20:00 WIB
  15: {
    fp1:        { date: "2026-09-04", time: "11:30:00Z" },
    fp2:        { date: "2026-09-04", time: "15:00:00Z" },
    fp3:        { date: "2026-09-05", time: "10:30:00Z" },
    qualifying: { date: "2026-09-05", time: "14:00:00Z" },
    race:       { date: "2026-09-06", time: "13:00:00Z" },
  },

  // ── R16 MADRID · CEST = UTC+2 ────────────────────────────
  // FP1:   Jum 11/09 11:30 UTC → 18:30 WIB
  // FP2:   Jum 11/09 15:00 UTC → 22:00 WIB
  // FP3:   Sab 12/09 10:30 UTC → 17:30 WIB
  // Quali: Sab 12/09 14:00 UTC → 21:00 WIB
  // Race:  Min 13/09 13:00 UTC → 20:00 WIB
  16: {
    fp1:        { date: "2026-09-11", time: "11:30:00Z" },
    fp2:        { date: "2026-09-11", time: "15:00:00Z" },
    fp3:        { date: "2026-09-12", time: "10:30:00Z" },
    qualifying: { date: "2026-09-12", time: "14:00:00Z" },
    race:       { date: "2026-09-13", time: "13:00:00Z" },
  },

  // ── R17 AZERBAIJAN · AZT = UTC+4 ─────────────────────────
  // FP1:   Kam 24/09 09:30 UTC → 16:30 WIB
  // FP2:   Kam 24/09 13:00 UTC → 20:00 WIB
  // FP3:   Jum 25/09 08:30 UTC → 15:30 WIB
  // Quali: Jum 25/09 12:00 UTC → 19:00 WIB
  // Race:  SAB 26/09 11:00 UTC → 18:00 WIB ← Baku race hari Sabtu
  17: {
    fp1:        { date: "2026-09-24", time: "09:30:00Z" },
    fp2:        { date: "2026-09-24", time: "13:00:00Z" },
    fp3:        { date: "2026-09-25", time: "08:30:00Z" },
    qualifying: { date: "2026-09-25", time: "12:00:00Z" },
    race:       { date: "2026-09-26", time: "11:00:00Z" },
  },

  // ── R18 SINGAPORE SPRINT · SGT = UTC+8 ───────────────────
  // FP1:      Jum 09/10 09:30 UTC → 16:30 WIB
  // Sprint Q: Jum 09/10 13:30 UTC → 20:30 WIB
  // Sprint:   Sab 10/10 09:00 UTC → 16:00 WIB
  // Quali:    Sab 10/10 13:00 UTC → 20:00 WIB
  // Race:     Min 11/10 12:00 UTC → 19:00 WIB
  18: {
    sprint: true,
    fp1:        { date: "2026-10-09", time: "09:30:00Z" },
    fp2:        { date: "2026-10-09", time: "13:30:00Z" },
    fp3:        { date: "2026-10-10", time: "09:00:00Z" },
    qualifying: { date: "2026-10-10", time: "13:00:00Z" },
    race:       { date: "2026-10-11", time: "12:00:00Z" },
  },

  // ── R19 USA (AUSTIN) · CDT = UTC-5 ───────────────────────
  // FP1:   Jum 23/10 18:30 UTC → 01:30 WIB (Sabtu)
  // FP2:   Jum 23/10 22:00 UTC → 05:00 WIB (Sabtu)
  // FP3:   Sab 24/10 17:30 UTC → 00:30 WIB (Minggu)
  // Quali: Sab 24/10 21:00 UTC → 04:00 WIB (Minggu)
  // Race:  Min 25/10 19:00 UTC → 02:00 WIB (Senin)
  19: {
    fp1:        { date: "2026-10-23", time: "18:30:00Z" },
    fp2:        { date: "2026-10-23", time: "22:00:00Z" },
    fp3:        { date: "2026-10-24", time: "17:30:00Z" },
    qualifying: { date: "2026-10-24", time: "21:00:00Z" },
    race:       { date: "2026-10-25", time: "19:00:00Z" },
  },

  // ── R20 MEXICO · CST = UTC-6 ─────────────────────────────
  // FP1:   Jum 30/10 18:30 UTC → 01:30 WIB (Sabtu)
  // FP2:   Jum 30/10 22:00 UTC → 05:00 WIB (Sabtu)
  // FP3:   Sab 31/10 17:30 UTC → 00:30 WIB (Minggu)
  // Quali: Sab 31/10 21:00 UTC → 04:00 WIB (Minggu)
  // Race:  Min 01/11 20:00 UTC → 03:00 WIB (Senin)
  20: {
    fp1:        { date: "2026-10-30", time: "18:30:00Z" },
    fp2:        { date: "2026-10-30", time: "22:00:00Z" },
    fp3:        { date: "2026-10-31", time: "17:30:00Z" },
    qualifying: { date: "2026-10-31", time: "21:00:00Z" },
    race:       { date: "2026-11-01", time: "20:00:00Z" },
  },

  // ── R21 BRAZIL · BRT = UTC-3 ─────────────────────────────
  // FP1:   Jum 06/11 14:30 UTC → 21:30 WIB
  // FP2:   Jum 06/11 18:00 UTC → 01:00 WIB (Sabtu)
  // FP3:   Sab 07/11 13:30 UTC → 20:30 WIB
  // Quali: Sab 07/11 17:00 UTC → 00:00 WIB (Minggu)
  // Race:  Min 08/11 17:00 UTC → 00:00 WIB (Senin)
  21: {
    fp1:        { date: "2026-11-06", time: "14:30:00Z" },
    fp2:        { date: "2026-11-06", time: "18:00:00Z" },
    fp3:        { date: "2026-11-07", time: "13:30:00Z" },
    qualifying: { date: "2026-11-07", time: "17:00:00Z" },
    race:       { date: "2026-11-08", time: "17:00:00Z" },
  },

  // ── R22 LAS VEGAS · PST = UTC-8 ──────────────────────────
  // Race tengah malam Vegas = pagi WIB
  // FP1:   Kam 19/11 06:30 UTC → 13:30 WIB
  // FP2:   Kam 19/11 10:00 UTC → 17:00 WIB
  // FP3:   Jum 20/11 03:30 UTC → 10:30 WIB
  // Quali: Jum 20/11 06:00 UTC → 13:00 WIB
  // Race:  SAB 21/11 06:00 UTC → 13:00 WIB ← Vegas race hari Sabtu
  22: {
    fp1:        { date: "2026-11-19", time: "06:30:00Z" },
    fp2:        { date: "2026-11-19", time: "10:00:00Z" },
    fp3:        { date: "2026-11-20", time: "03:30:00Z" },
    qualifying: { date: "2026-11-20", time: "06:00:00Z" },
    race:       { date: "2026-11-21", time: "06:00:00Z" },
  },

  // ── R23 QATAR · AST = UTC+3 ──────────────────────────────
  // FP1:   Jum 27/11 13:30 UTC → 20:30 WIB
  // FP2:   Jum 27/11 17:00 UTC → 00:00 WIB (Sabtu)
  // FP3:   Sab 28/11 12:30 UTC → 19:30 WIB
  // Quali: Sab 28/11 16:00 UTC → 23:00 WIB
  // Race:  Min 29/11 16:00 UTC → 23:00 WIB
  23: {
    fp1:        { date: "2026-11-27", time: "13:30:00Z" },
    fp2:        { date: "2026-11-27", time: "17:00:00Z" },
    fp3:        { date: "2026-11-28", time: "12:30:00Z" },
    qualifying: { date: "2026-11-28", time: "16:00:00Z" },
    race:       { date: "2026-11-29", time: "16:00:00Z" },
  },

  // ── R24 ABU DHABI · GST = UTC+4 ──────────────────────────
  // FP1:   Jum 04/12 09:30 UTC → 16:30 WIB
  // FP2:   Jum 04/12 13:00 UTC → 20:00 WIB
  // FP3:   Sab 05/12 09:30 UTC → 16:30 WIB
  // Quali: Sab 05/12 13:00 UTC → 20:00 WIB
  // Race:  Min 06/12 13:00 UTC → 20:00 WIB
  24: {
    fp1:        { date: "2026-12-04", time: "09:30:00Z" },
    fp2:        { date: "2026-12-04", time: "13:00:00Z" },
    fp3:        { date: "2026-12-05", time: "09:30:00Z" },
    qualifying: { date: "2026-12-05", time: "13:00:00Z" },
    race:       { date: "2026-12-06", time: "13:00:00Z" },
  },
};