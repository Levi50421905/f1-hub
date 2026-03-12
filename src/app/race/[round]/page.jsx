"use client";
// src/app/race/[round]/page.jsx

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTeamColor, getCountryFlag } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtWIB(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "TBA";
  try {
    const dt  = new Date(`${dateStr}T${timeStr}`);
    const wib = new Date(dt.getTime() + 7 * 3600 * 1000);
    const DAYS   = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
    const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return `${DAYS[wib.getUTCDay()]}, ${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()]} · ${
      String(wib.getUTCHours()).padStart(2,"0")}:${String(wib.getUTCMinutes()).padStart(2,"0")} WIB`;
  } catch { return "TBA"; }
}

// ─── Circuit Info ─────────────────────────────────────────────────────────────

const CIRCUIT_INFO = {
  1:  { laps:58,  length:5.278, turns:14, lapRecord:"1:20.235", lapHolder:"Leclerc",       lapYear:2022 },
  2:  { laps:56,  length:5.451, turns:16, lapRecord:"1:32.238", lapHolder:"M. Schumacher", lapYear:2004 },
  3:  { laps:53,  length:5.807, turns:18, lapRecord:"1:30.983", lapHolder:"Verstappen",    lapYear:2019 },
  4:  { laps:57,  length:5.412, turns:15, lapRecord:"1:31.447", lapHolder:"De La Rosa",    lapYear:2005 },
  5:  { laps:50,  length:6.174, turns:27, lapRecord:"1:30.734", lapHolder:"Hamilton",      lapYear:2021 },
  6:  { laps:57,  length:5.412, turns:19, lapRecord:"1:26.841", lapHolder:"Verstappen",    lapYear:2023 },
  7:  { laps:70,  length:4.361, turns:14, lapRecord:"1:13.078", lapHolder:"Bottas",        lapYear:2019 },
  8:  { laps:78,  length:3.337, turns:19, lapRecord:"1:12.909", lapHolder:"Leclerc",       lapYear:2021 },
  9:  { laps:66,  length:4.657, turns:14, lapRecord:"1:16.330", lapHolder:"Verstappen",    lapYear:2023 },
  10: { laps:71,  length:4.318, turns:10, lapRecord:"1:05.619", lapHolder:"Bottas",        lapYear:2020 },
  11: { laps:52,  length:5.891, turns:18, lapRecord:"1:27.097", lapHolder:"Hamilton",      lapYear:2020 },
  12: { laps:44,  length:7.004, turns:20, lapRecord:"1:46.286", lapHolder:"Verstappen",    lapYear:2018 },
  13: { laps:70,  length:4.381, turns:14, lapRecord:"1:16.627", lapHolder:"Hamilton",      lapYear:2020 },
  14: { laps:72,  length:4.259, turns:14, lapRecord:"1:11.097", lapHolder:"Verstappen",    lapYear:2021 },
  15: { laps:53,  length:5.793, turns:11, lapRecord:"1:21.046", lapHolder:"Barrichello",   lapYear:2004 },
  16: { laps:55,  length:5.537, turns:21, lapRecord:"—",        lapHolder:"—",             lapYear:2026 },
  17: { laps:51,  length:6.003, turns:20, lapRecord:"1:43.009", lapHolder:"Leclerc",       lapYear:2019 },
  18: { laps:61,  length:5.063, turns:23, lapRecord:"1:35.867", lapHolder:"Leclerc",       lapYear:2023 },
  19: { laps:56,  length:5.513, turns:20, lapRecord:"1:36.169", lapHolder:"Leclerc",       lapYear:2019 },
  20: { laps:71,  length:4.304, turns:17, lapRecord:"1:17.774", lapHolder:"Bottas",        lapYear:2021 },
  21: { laps:71,  length:4.309, turns:15, lapRecord:"1:10.540", lapHolder:"Verstappen",    lapYear:2023 },
  22: { laps:50,  length:6.201, turns:17, lapRecord:"1:35.490", lapHolder:"Leclerc",       lapYear:2023 },
  23: { laps:57,  length:5.380, turns:16, lapRecord:"1:24.319", lapHolder:"Verstappen",    lapYear:2023 },
  24: { laps:58,  length:5.281, turns:16, lapRecord:"1:26.103", lapHolder:"Verstappen",    lapYear:2021 },
};

// ─── Circuit SVG Paths ────────────────────────────────────────────────────────
// ViewBox: 0 0 200 160
// Each path hand-crafted to resemble the real circuit layout.
// sfX/sfY = start/finish line position.

const CIRCUIT_PATHS = {
  // R1 — Albert Park, Melbourne
  // Anticlockwise. Roughly rectangular lake loop. Long back straight top-right,
  // sweeping bottom, chicanes left side, hairpin top-left.
  1: {
    d: `M 100,15 L 158,15 Q 178,15 180,32 L 182,55 Q 183,68 170,72
        L 148,75 L 145,86 Q 143,97 154,101 L 168,103 Q 182,105 183,120
        L 181,136 Q 178,148 162,148 L 112,148 Q 96,148 90,138
        L 68,108 Q 60,96 46,95 L 32,94 Q 18,93 17,80 L 17,55
        Q 17,36 32,30 L 65,18 Q 80,14 100,15 Z`,
    sfX1:100, sfY1:12, sfX2:100, sfY2:20,
  },
  // R2 — Shanghai International Circuit
  // Snail spiral turn 1/2 (top left), long back straight (right side),
  // hairpin complex bottom, short return straight.
  2: {
    d: `M 52,32 Q 50,12 70,10 L 105,10 Q 132,10 142,22 L 150,36
        Q 158,50 148,60 L 128,65 Q 112,68 108,58 Q 104,48 115,42
        Q 126,36 118,26 Q 110,16 94,20 Q 78,24 76,40 Q 74,56 92,60
        L 165,60 Q 180,60 182,74 L 182,100 Q 182,115 168,117
        L 75,117 Q 58,117 54,128 L 52,138 Q 49,148 38,148
        L 24,148 Q 12,146 12,132 L 13,108 Q 14,94 28,92
        L 35,90 L 35,42 Q 35,30 52,32 Z`,
    sfX1:35, sfY1:28, sfX2:35, sfY2:42,
  },
  // R3 — Suzuka
  // Iconic figure-of-8 crossover. Top half: 130R, Casio, Degner.
  // Bottom half: Spoon, back straight. Crossover at centre.
  3: {
    d: `M 95,12 L 122,12 Q 142,12 147,26 L 150,44 Q 152,58 140,63
        L 115,67 Q 100,69 95,80 L 92,92 Q 90,102 100,106 L 122,108
        Q 140,108 145,122 L 145,136 Q 145,148 128,149 L 72,149
        Q 55,149 53,135 L 52,118 Q 52,104 66,100 L 82,97
        Q 94,95 96,83 L 98,71 Q 100,59 86,55 L 62,51
        Q 48,48 46,35 L 46,20 Q 46,9 62,9 L 95,12 Z`,
    sfX1:95, sfY1:9, sfX2:95, sfY2:17,
  },
  // R4 — Bahrain International Circuit
  // Outer layout. Wide smooth corners, desert surface.
  // Distinctive concave back section.
  4: {
    d: `M 72,15 L 148,15 Q 168,15 170,30 L 172,54 Q 173,68 158,72
        L 132,75 L 130,88 Q 128,98 140,101 L 158,103 Q 172,105 174,120
        L 172,136 Q 169,148 152,148 L 62,148 Q 44,146 42,131
        L 40,106 Q 38,92 52,88 L 72,86 Q 86,84 86,72
        L 84,58 Q 82,46 66,42 L 44,38 Q 30,35 28,22
        L 30,14 Q 36,7 50,10 L 72,15 Z`,
    sfX1:72, sfY1:12, sfX2:72, sfY2:20,
  },
  // R5 — Jeddah Corniche Circuit
  // Very long, narrow street circuit along the coast. High-speed flowing walls.
  // Long front straight, tight T1 hairpin, multiple 90-degree turns through middle.
  5: {
    d: `M 44,13 L 162,13 Q 177,13 178,25 L 179,40 Q 180,52 168,56
        L 150,58 L 148,70 Q 146,82 160,86 L 176,88 Q 184,90 184,104
        L 182,124 Q 180,138 164,140 L 146,141 Q 132,141 127,130
        L 124,115 Q 121,102 108,100 L 84,100 Q 70,100 67,112
        L 64,126 Q 61,138 46,140 L 28,140 Q 15,138 14,124
        L 14,98 Q 14,84 28,81 L 40,79 L 40,22 Q 40,12 44,13 Z`,
    sfX1:40, sfY1:10, sfX2:40, sfY2:22,
  },
  // R6 — Miami International Autodrome
  // Hard Rock Stadium loop. Wide flowing corners, two long straights.
  6: {
    d: `M 38,38 Q 36,16 62,13 L 132,13 Q 160,13 165,30 L 168,58
        Q 170,76 154,82 L 134,84 Q 120,84 116,96 L 113,110
        Q 111,122 124,125 L 150,126 Q 168,127 170,142
        Q 172,152 155,153 L 60,153 Q 42,151 39,136 L 38,120
        Q 36,104 52,100 L 72,98 Q 86,96 86,84 L 84,70
        Q 82,56 64,52 L 44,48 Q 36,46 38,38 Z`,
    sfX1:38, sfY1:28, sfX2:46, sfY2:28,
  },
  // R7 — Circuit Gilles Villeneuve, Montreal
  // Île Notre-Dame. Long main straight, two chicanes (including Wall of Champions),
  // hairpin at far end.
  7: {
    d: `M 95,10 L 158,10 Q 174,10 175,24 L 176,44 Q 177,57 163,62
        L 144,65 Q 130,66 126,77 L 123,91 Q 121,103 135,107
        L 162,109 Q 177,111 178,126 L 176,140 Q 173,150 157,150
        L 96,150 Q 78,148 74,134 L 71,118 Q 69,104 82,100
        L 97,97 Q 110,95 111,83 L 110,70 Q 109,57 90,53
        L 64,49 Q 48,46 47,33 L 48,20 Q 51,9 65,9 L 95,10 Z`,
    sfX1:95, sfY1:7, sfX2:95, sfY2:15,
  },
  // R8 — Circuit de Monaco
  // Tight street circuit. Beau Rivage uphill, Casino hairpin, Mirabeau,
  // tunnel, Swimming Pool chicane, Rascasse, Anthony Noghes.
  8: {
    d: `M 88,13 L 132,13 Q 150,15 154,30 L 156,46 Q 157,58 146,62
        L 127,64 Q 116,64 112,75 L 110,87 Q 113,99 128,103
        L 150,106 Q 165,109 167,123 L 166,136 Q 164,148 150,150
        L 130,152 Q 117,153 108,142 L 100,128 Q 94,116 80,113
        L 63,112 Q 48,112 41,126 L 37,140 Q 32,151 18,151
        L 10,150 Q 2,144 4,130 L 8,104 Q 11,90 27,86
        L 46,82 Q 58,79 61,67 L 62,46 Q 62,28 76,20 L 88,13 Z`,
    sfX1:88, sfY1:10, sfX2:88, sfY2:18,
  },
  // R9 — Circuit de Barcelona-Catalunya
  // Long main straight, tight T1 right-hander, back section with flowing corners,
  // Campsa, Bus Stop, final chicane.
  9: {
    d: `M 55,15 L 152,15 Q 170,15 172,30 L 174,50 Q 175,64 160,68
        L 136,72 Q 121,73 115,85 L 112,99 Q 109,112 122,115
        L 150,117 Q 168,119 170,134 L 168,145 Q 165,154 149,154
        L 56,154 Q 38,152 36,137 L 34,120 Q 32,105 48,101
        L 68,98 Q 82,96 84,84 L 86,70 Q 88,57 70,53
        L 50,48 Q 35,43 34,28 L 36,17 Q 40,10 52,12 L 55,15 Z`,
    sfX1:55, sfY1:12, sfX2:55, sfY2:20,
  },
  // R10 — Red Bull Ring, Spielberg
  // Short hilly circuit. Three main corners: T1 downhill hairpin,
  // Remus curve, Rindt corner. One DRS zone.
  10: {
    d: `M 90,18 L 128,18 Q 144,18 146,32 L 148,54 Q 149,68 134,72
        L 112,75 Q 99,76 95,89 L 92,104 Q 90,118 105,122
        L 132,124 Q 150,126 152,140 Q 153,152 136,153
        L 76,153 Q 59,151 57,137 L 55,120 Q 53,106 68,102
        L 82,99 Q 93,97 94,86 L 92,70 Q 90,56 76,52
        L 58,47 Q 44,43 44,29 L 48,18 Q 55,10 70,12 L 90,18 Z`,
    sfX1:90, sfY1:14, sfX2:90, sfY2:22,
  },
  // R11 — Silverstone
  // Old RAF airfield. Copse, Maggotts, Beckets, Chapel S-curves (unique),
  // Stowe hairpin, Club corner back to pit straight.
  11: {
    d: `M 60,16 L 150,16 Q 168,16 170,30 L 172,50 Q 172,64 158,68
        L 138,70 Q 122,70 114,58 Q 106,46 94,46 Q 82,46 76,58
        Q 70,70 84,78 L 110,81 Q 128,83 136,96 L 138,112
        Q 140,128 124,133 L 96,135 Q 78,135 70,122 L 58,106
        Q 50,92 34,90 L 20,88 Q 7,86 7,72 L 8,46
        Q 10,28 28,24 L 48,19 L 60,16 Z`,
    sfX1:60, sfY1:12, sfX2:60, sfY2:20,
  },
  // R12 — Spa-Francorchamps
  // Legendary. Eau Rouge / Raidillon uphill, Kemmel straight,
  // Les Combes hairpin, Pouhon fast left, Blanchimont, Bus Stop chicane.
  12: {
    d: `M 74,12 L 150,12 Q 170,12 172,26 L 174,44 Q 175,58 160,62
        L 138,66 Q 122,68 113,54 Q 102,38 88,38 Q 74,38 68,54
        Q 62,70 78,78 L 106,83 Q 124,86 130,102 L 132,120
        Q 134,135 118,140 L 88,142 Q 72,142 65,130 L 55,113
        Q 46,96 30,93 L 16,91 Q 4,89 4,75 L 6,48
        Q 9,30 28,26 L 52,18 Q 62,14 74,12 Z`,
    sfX1:74, sfY1:9, sfX2:74, sfY2:17,
  },
  // R13 — Hungaroring
  // Very tight and slow circuit. No real straight. Lots of medium-speed corners.
  13: {
    d: `M 80,15 L 132,15 Q 150,16 152,32 L 154,54 Q 155,68 140,73
        L 116,77 Q 102,79 97,92 L 94,107 Q 93,120 108,123
        L 138,125 Q 156,127 158,143 Q 159,154 142,154
        L 70,154 Q 52,152 50,137 L 49,120 Q 48,107 63,103
        L 80,100 Q 93,98 94,86 L 96,71 Q 98,57 80,52
        L 59,46 Q 44,41 43,27 L 47,16 Q 52,9 64,12 L 80,15 Z`,
    sfX1:80, sfY1:12, sfX2:80, sfY2:20,
  },
  // R14 — Zandvoort
  // Banked Hugenholtz hairpin (T3), banked Arie Luyendyk (T14),
  // tight Tarzan hairpin T1, dune section.
  14: {
    d: `M 86,14 L 132,14 Q 150,14 154,28 L 156,48 Q 158,63 142,68
        L 116,72 Q 102,73 97,86 L 94,101 Q 93,114 108,117
        L 140,119 Q 160,121 162,136 Q 164,150 146,152
        L 66,152 Q 48,150 46,135 L 44,118 Q 42,103 58,99
        L 74,96 Q 86,94 87,82 L 86,66 Q 85,52 70,47
        L 50,42 Q 36,37 36,22 L 42,12 Q 50,6 64,10 L 86,14 Z`,
    sfX1:86, sfY1:11, sfX2:86, sfY2:19,
  },
  // R15 — Monza
  // High-speed parkland. Two chicane complexes (Variante del Rettifilo, Variante della Roggia),
  // Lesmo 1 & 2, Ascari, Parabolica (Curva Alboreto).
  15: {
    d: `M 82,12 L 140,12 Q 160,12 163,27 L 166,46 Q 168,62 153,67
        L 130,70 L 126,82 Q 122,94 136,98 L 162,100 Q 178,102 180,118
        L 178,134 Q 175,147 158,148 L 95,148 Q 76,146 71,132
        L 68,116 Q 66,102 80,98 L 102,96 Q 116,94 117,82
        L 118,68 Q 118,54 100,48 L 78,43 Q 62,38 60,23
        L 63,13 Q 69,7 80,11 L 82,12 Z`,
    sfX1:82, sfY1:9, sfX2:82, sfY2:17,
  },
  // R16 — Madrid IFEMA Street Circuit (NEW 2026)
  // Street circuit around IFEMA convention centre.
  // Long main straight, tight hairpins, flowing middle sector.
  16: {
    d: `M 60,15 L 154,15 Q 172,15 174,30 L 176,52 Q 177,66 162,71
        L 138,75 Q 123,77 117,90 L 114,104 Q 112,118 126,121
        L 156,123 Q 174,125 175,140 L 173,150 Q 170,158 155,158
        L 56,158 Q 38,156 36,141 L 34,124 Q 32,109 48,105
        L 70,102 Q 84,100 86,88 L 87,74 Q 88,61 70,57
        L 48,52 Q 34,47 34,32 L 37,19 Q 42,11 55,13 L 60,15 Z`,
    sfX1:60, sfY1:12, sfX2:60, sfY2:20,
  },
  // R17 — Baku City Circuit
  // Long pit straight ~2 km. Tight castle section (T8-T10, very narrow).
  // Flowing sections through T1-T3 and T15-T20.
  17: {
    d: `M 92,10 L 163,10 Q 178,10 180,24 L 181,42 Q 182,56 168,60
        L 148,63 L 146,76 Q 145,89 159,93 L 176,95 Q 186,97 186,113
        L 184,134 Q 182,148 165,150 L 98,151 Q 80,150 74,136
        L 70,120 Q 66,106 52,103 L 30,101 Q 16,99 14,84
        L 14,63 Q 14,46 30,41 L 50,36 Q 65,32 68,20
        L 72,10 Q 78,4 92,10 Z`,
    sfX1:92, sfY1:7, sfX2:92, sfY2:15,
  },
  // R18 — Marina Bay Street Circuit, Singapore
  // Night race. T1/T2 right-left, Anderson Bridge, Esplanade Drive,
  // Singapore Sling chicane, hairpin, pit straight.
  18: {
    d: `M 82,12 L 140,12 Q 158,12 161,26 L 163,44 Q 165,60 150,65
        L 126,70 Q 110,73 104,86 L 101,100 Q 99,112 88,117
        L 70,120 Q 54,121 48,136 L 46,150 Q 44,162 30,163
        L 15,162 Q 4,156 6,141 L 10,116 Q 13,102 28,98
        L 48,94 Q 63,91 66,78 L 67,61 Q 68,46 52,42
        L 34,38 Q 20,34 18,19 L 24,8 Q 32,2 48,6
        L 82,12 Z`,
    sfX1:82, sfY1:9, sfX2:82, sfY2:17,
  },
  // R19 — Circuit of the Americas, Austin
  // Distinctive uphill T1 hairpin, S12/S13 fast esses (similar to Maggotts),
  // long back straight, T11 hairpin, tight infield.
  19: {
    d: `M 72,10 L 147,10 Q 167,10 170,26 L 172,46 Q 174,62 158,68
        L 136,73 Q 119,76 112,90 L 108,107 Q 105,122 122,127
        L 150,129 Q 170,131 172,147 Q 174,160 155,161
        L 62,161 Q 44,159 41,144 L 38,126 Q 36,111 53,106
        L 72,102 Q 87,99 88,86 L 88,70 Q 88,55 72,49
        L 50,42 Q 34,36 32,21 L 38,10 Q 48,4 63,7 L 72,10 Z`,
    sfX1:72, sfY1:7, sfX2:72, sfY2:15,
  },
  // R20 — Autodromo Hermanos Rodriguez, Mexico City
  // Long back stadium straight, Peraltada wide sweeping corner,
  // Foro Sol stadium section, Esses.
  20: {
    d: `M 78,12 L 142,12 Q 161,12 164,27 L 167,48 Q 169,63 153,69
        L 129,73 Q 113,75 106,89 L 103,105 Q 100,120 115,124
        L 144,126 Q 163,128 165,144 L 163,155 Q 161,163 145,163
        L 63,163 Q 44,161 42,145 L 40,126 Q 38,110 55,106
        L 75,103 Q 89,101 91,88 L 92,73 Q 92,58 76,53
        L 54,47 Q 38,42 37,27 L 41,15 Q 48,7 63,10 L 78,12 Z`,
    sfX1:78, sfY1:9, sfX2:78, sfY2:17,
  },
  // R21 — Autodromo Jose Carlos Pace, Interlagos
  // Anticlockwise. Senna S (T1/T2), Curva do Sol, Descida do Lago,
  // Ferradura hairpin, Juncao, Subida dos Boxes.
  21: {
    d: `M 100,12 L 148,12 Q 166,12 168,26 L 171,46 Q 173,60 158,66
        L 132,71 Q 116,73 110,87 L 106,103 Q 102,118 92,123
        L 72,127 Q 56,128 50,143 L 48,157 Q 45,168 30,169
        L 14,168 Q 3,161 6,146 L 12,123 Q 17,108 35,103
        L 56,98 Q 71,93 74,80 L 76,63 Q 77,48 60,42
        L 40,35 Q 24,28 25,12 L 33,4 Q 44,0 58,5
        L 100,12 Z`,
    sfX1:100, sfY1:9, sfX2:100, sfY2:17,
  },
  // R22 — Las Vegas Strip Circuit
  // Three long straights along the Strip. Tight hairpins at each end.
  // Koval Lane section in the middle. High speed.
  22: {
    d: `M 55,12 L 157,12 Q 176,12 178,27 L 179,45 Q 180,59 166,64
        L 146,67 L 144,80 Q 142,93 158,97 L 175,100 Q 186,102 186,118
        L 184,137 Q 182,152 165,154 L 97,154 Q 79,152 74,137
        L 70,120 Q 67,106 52,102 L 32,99 Q 18,97 16,81
        L 16,60 Q 16,44 31,39 L 42,36 L 42,20 Q 42,10 55,12 Z`,
    sfX1:42, sfY1:10, sfX2:42, sfY2:22,
  },
  // R23 — Lusail International Circuit, Qatar
  // Fast flowing kidney-shaped circuit. Long sweeping turns,
  // few real braking zones. Almost no slow corners.
  23: {
    d: `M 94,12 Q 144,6 168,30 L 174,56 Q 180,82 162,100
        L 134,110 Q 116,116 108,133 L 105,148 Q 102,162 84,163
        L 58,163 Q 36,160 32,142 L 29,120 Q 26,100 44,90
        L 68,81 Q 86,74 88,56 Q 90,38 72,26
        Q 54,14 58,5 Q 65,0 78,4 L 94,12 Z`,
    sfX1:94, sfY1:9, sfX2:94, sfY2:17,
  },
  // R24 — Yas Marina Circuit, Abu Dhabi
  // Hotel section (passes underneath the Yas Viceroy Hotel),
  // marina loop, W-shaped final sector (T11-T16).
  24: {
    d: `M 80,12 L 148,12 Q 167,12 169,27 L 171,48 Q 173,63 156,69
        L 130,73 Q 113,75 107,90 L 104,105 Q 102,119 86,123
        Q 69,126 62,140 L 60,153 Q 59,165 72,167 Q 86,169 90,157
        L 91,144 Q 93,132 109,130 L 142,130 Q 162,130 165,145
        L 166,158 Q 167,170 152,170 L 36,170 Q 18,168 16,152
        L 15,134 Q 14,118 31,114 L 52,111 Q 66,109 67,96
        L 67,80 Q 67,64 50,59 L 30,54 Q 16,49 15,33
        L 19,18 Q 28,9 44,11 L 80,12 Z`,
    sfX1:80, sfY1:9, sfX2:80, sfY2:17,
  },
};

// ─── Circuit SVG Component ────────────────────────────────────────────────────

function CircuitShape({ round, color = "#ef4444" }) {
  const circuit = CIRCUIT_PATHS[round];
  if (!circuit) return null;
  const { d, sfX1, sfY1, sfX2, sfY2 } = circuit;
  const id = `glow-${round}`;

  return (
    <svg
      viewBox="0 0 200 185"
      style={{ width: "100%", maxWidth: 300, height: "auto" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Shadow layer */}
      <path d={d} fill="none" stroke={color + "22"} strokeWidth="11"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Main track */}
      <path d={d} fill="none" stroke={color} strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id})`}/>
      {/* Start / Finish line */}
      <line x1={sfX1} y1={sfY1} x2={sfX2} y2={sfY2}
        stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          height: 44, background: "#0d1117", borderRadius: 8,
          animation: "pulse 1.5s ease infinite",
          animationDelay: `${i * 0.08}s`,
        }}/>
      ))}
    </div>
  );
}

function NoData({ children }) {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px",
      background: "#0d1117", borderRadius: 12,
      border: "1px solid #1f2937",
      fontSize: 13, color: "#4b5563",
    }}>
      {children}
    </div>
  );
}

const TH = {
  fontSize: 10, color: "#4b5563", fontFamily: "monospace",
  letterSpacing: 1, padding: "8px 10px", textAlign: "left",
  borderBottom: "1px solid #1a1f2e",
};
const TD = { padding: "10px 10px", fontSize: 13 };
const rowBg = (i) => ({ background: i % 2 === 0 ? "#0d1117" : "transparent", borderBottom: "1px solid #0f1218" });

function driverName(d) {
  if (!d) return "—";
  if (d.name) return d.name;
  if (d.firstName && d.lastName) return `${d.firstName.charAt(0)}. ${d.lastName}`;
  return d.code || "—";
}

// ─── Tab: Race ────────────────────────────────────────────────────────────────

function RaceTab({ isFinished, data }) {
  if (!isFinished) return <NoData>Hasil race akan muncul setelah race selesai.</NoData>;
  if (!data?.results?.length) return <NoData>Data race tidak tersedia.</NoData>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>{["POS","DRIVER","TIM","WAKTU / STATUS","PTS"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
      <tbody>
        {data.results.map((r, i) => {
          const pos   = Number(r.position ?? r.pos ?? i + 1);
          const color = getTeamColor(r.team?.id || r.team?.name || r.driver?.team || "");
          return (
            <tr key={i} style={rowBg(i)}>
              <td style={{ ...TD, width: 40, fontWeight: 900, color: pos <= 3 ? "#fbbf24" : "#9ca3af" }}>{pos}</td>
              <td style={{ ...TD, fontWeight: 600, color }}>{driverName(r.driver)}</td>
              <td style={{ ...TD, fontSize: 11, color: "#4b5563" }}>{r.team?.name || r.driver?.team || "—"}</td>
              <td style={{ ...TD, fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{r.time || r.status || "—"}</td>
              <td style={{ ...TD, fontWeight: 700, color: "#fbbf24" }}>{r.points ?? 0}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Tab: Qualifying ──────────────────────────────────────────────────────────

function QualiTab({ data }) {
  if (!data?.results?.length) return <NoData>Hasil qualifying belum tersedia.</NoData>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>{["POS","DRIVER","Q1","Q2","Q3"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
      <tbody>
        {data.results.map((r, i) => {
          const pos   = Number(r.pos ?? r.position ?? i + 1);
          const color = getTeamColor(r.team?.id || r.team?.name || "");
          return (
            <tr key={i} style={rowBg(i)}>
              <td style={{ ...TD, width: 40, fontWeight: 900, color: pos <= 3 ? "#fbbf24" : "#9ca3af" }}>{pos}</td>
              <td style={{ ...TD, fontWeight: 600, color }}>{driverName(r.driver)}</td>
              {["q1","q2","q3"].map(q => (
                <td key={q} style={{ ...TD, fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{r[q] || "—"}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Tab: Pit Stops ───────────────────────────────────────────────────────────

function PitsTab({ isFinished, data }) {
  if (!isFinished) return <NoData>Data pit stop akan muncul setelah race selesai.</NoData>;
  if (!data?.pitstops?.length) return <NoData>Data pit stop tidak tersedia.</NoData>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>{["DRIVER","STOP KE","LAP","DURASI"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
      <tbody>
        {data.pitstops.map((p, i) => (
          <tr key={i} style={rowBg(i)}>
            <td style={{ ...TD, fontWeight: 600 }}>{driverName(p.driver)}</td>
            <td style={{ ...TD, color: "#6b7280" }}>{p.stop}</td>
            <td style={{ ...TD, color: "#6b7280" }}>Lap {p.lap}</td>
            <td style={{ ...TD, fontFamily: "monospace", color: "#fbbf24" }}>{p.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Tab: Circuit ─────────────────────────────────────────────────────────────

function CircuitTab({ round, circuit }) {
  if (!circuit) return <NoData>Info sirkuit tidak tersedia.</NoData>;
  const stats = [
    { label: "JUMLAH LAP",       value: String(circuit.laps) },
    { label: "PANJANG SIRKUIT",  value: `${circuit.length} km` },
    { label: "JUMLAH TIKUNGAN",  value: String(circuit.turns) },
    { label: "JARAK TOTAL RACE", value: `${(circuit.laps * circuit.length).toFixed(1)} km` },
  ];
  return (
    <div>
      <div style={{
        background: "#0d1117", border: "1px solid #1a1f2e",
        borderRadius: 14, padding: 20,
        display: "flex", justifyContent: "center", marginBottom: 12,
      }}>
        <CircuitShape round={round} color="#ef4444" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{value}</div>
          </div>
        ))}
        <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 10, padding: 14, gridColumn: "span 2" }}>
          <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 4 }}>REKOR LAP TERCEPAT</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#ef4444" }}>{circuit.lapRecord}</div>
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>{circuit.lapHolder} · {circuit.lapYear}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RaceDetailPage() {
  const { round } = useParams();
  const roundNum  = parseInt(round);

  const [raceInfo,  setRaceInfo]  = useState(null);
  const [tab,       setTab]       = useState("race");
  const [raceData,  setRaceData]  = useState(null);
  const [qualiData, setQualiData] = useState(null);
  const [pitData,   setPitData]   = useState(null);
  const [loading,   setLoading]   = useState(false);

  const sessions = SCHEDULE_2026[roundNum] || {};
  const isSprint = !!sessions.sprint;
  const circuit  = CIRCUIT_INFO[roundNum];

  const TABS = [
    { id: "race",    label: "🏁 Race" },
    { id: "quali",   label: "🔵 Qualifying" },
    ...(isSprint ? [{ id: "sprint", label: "⚡ Sprint" }] : []),
    { id: "pits",    label: "🔧 Pit Stops" },
    { id: "circuit", label: "🗺️ Sirkuit" },
  ];

  useEffect(() => {
    fetch(`/api/schedule`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setRaceInfo(json.data.find(r => r.round === roundNum) || null);
      });
  }, [roundNum]);

  useEffect(() => {
    if (!raceInfo) return;
    const finished = raceInfo.status === "finished";
    const tasks = {
      race:  { cond: tab === "race"  && !raceData  && finished, session: "race",       setter: setRaceData  },
      quali: { cond: tab === "quali" && !qualiData,             session: "qualifying",  setter: setQualiData },
      pits:  { cond: tab === "pits"  && !pitData   && finished, session: "pitstops",    setter: setPitData   },
    };
    const task = Object.values(tasks).find(t => t.cond);
    if (!task) return;
    setLoading(true);
    fetch(`/api/race?round=${roundNum}&session=${task.session}`)
      .then(r => r.json())
      .then(json => { if (json.success) task.setter(json.data); })
      .finally(() => setLoading(false));
  }, [tab, raceInfo]);

  if (!raceInfo) {
    return (
      <div style={{ minHeight: "100vh", background: "#050507" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
          <div style={{ height: 200, background: "#0d1117", borderRadius: 14, animation: "pulse 1.5s ease infinite" }}/>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
      </div>
    );
  }

  const isFinished = raceInfo.status === "finished";

  const STATUS = {
    finished: { bg: "#22c55e15", border: "#22c55e30", color: "#22c55e", text: "✅ Race sudah selesai — hasil tersedia" },
    ongoing:  { bg: "#ef444415", border: "#ef444430", color: "#ef4444", text: "🔴 Race sedang berlangsung!" },
    upcoming: { bg: "#fbbf2415", border: "#fbbf2430", color: "#fbbf24", text: "⏳ Race belum berlangsung — hasil akan muncul setelah selesai" },
  };
  const s = STATUS[raceInfo.status] || STATUS.upcoming;

  const sessionCards = [
    sessions.fp1        && { label: "FREE PRACTICE 1",                                  ...sessions.fp1,        highlight: false },
    sessions.fp2        && { label: isSprint ? "SPRINT QUALIFYING" : "FREE PRACTICE 2", ...sessions.fp2,        highlight: false },
    sessions.fp3        && { label: isSprint ? "SPRINT RACE" : "FREE PRACTICE 3",       ...sessions.fp3,        highlight: false },
    sessions.qualifying && { label: "QUALIFYING",                                        ...sessions.qualifying, highlight: false },
    sessions.race       && { label: "RACE",                                              ...sessions.race,       highlight: true  },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#050507", paddingBottom: 80 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>

        <Link href="/schedule" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "#6b7280", textDecoration: "none",
          background: "#0d1117", border: "1px solid #1f2937",
          borderRadius: 8, padding: "6px 12px", marginBottom: 20,
        }}>← Kalender</Link>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace", letterSpacing: 2, marginBottom: 6 }}>
            ROUND {roundNum} · {raceInfo.circuit?.country?.toUpperCase()}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>
            {getCountryFlag(raceInfo.circuit?.country)} {raceInfo.name}
          </div>
          <div style={{ fontSize: 12, color: "#4b5563" }}>
            {raceInfo.circuit?.name} · {raceInfo.circuit?.location}
          </div>
          {isSprint && (
            <span style={{
              display: "inline-block", marginTop: 8,
              background: "#7c3aed20", border: "1px solid #7c3aed40",
              color: "#a78bfa", fontSize: 10, fontWeight: 700,
              padding: "3px 10px", borderRadius: 100, fontFamily: "monospace",
            }}>⚡ SPRINT WEEKEND</span>
          )}
        </div>

        <div style={{
          background: s.bg, border: `1px solid ${s.border}`,
          borderRadius: 10, padding: "10px 14px", marginBottom: 20,
          fontSize: 12, color: s.color,
        }}>{s.text}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {sessionCards.map(({ label, date, time, highlight }) => (
            <div key={label} style={{
              background: highlight ? "#12050a" : "#0d1117",
              border: `1px solid ${highlight ? "#ef444430" : "#1a1f2e"}`,
              borderRadius: 10, padding: "10px 14px",
              ...(highlight ? { gridColumn: "span 2" } : {}),
            }}>
              <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? "#ef4444" : "#f9fafb" }}>{fmtWIB(date, time)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12,
              fontWeight: tab === id ? 700 : 400, cursor: "pointer",
              background: tab === id ? "#ef4444" : "#0d1117",
              color: tab === id ? "#fff" : "#6b7280",
              border: `1px solid ${tab === id ? "transparent" : "#1f2937"}`,
            }}>{label}</button>
          ))}
        </div>

        {loading && <LoadingSkeleton />}
        {!loading && tab === "race"   && <RaceTab    isFinished={isFinished} data={raceData}  />}
        {!loading && tab === "quali"  && <QualiTab   data={qualiData} />}
        {!loading && tab === "pits"   && <PitsTab    isFinished={isFinished} data={pitData}   />}
        {           tab === "circuit" && <CircuitTab round={roundNum} circuit={circuit} />}

      </div>
    </div>
  );
}