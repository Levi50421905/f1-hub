// lib/f1api.js
// ─────────────────────────────────────────────
// Helper untuk semua fetch ke Jolpica F1 API
// Jolpica = penerus Ergast, gratis, no API key
// Docs: https://api.jolpi.ca
// ─────────────────────────────────────────────

const BASE = "https://api.jolpi.ca/ergast/f1";
const SEASON = new Date().getFullYear();

async function fetchF1(path, limit = 100) {
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}.json${separator}limit=${limit}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`F1 API error: ${res.status} — ${path}`);
  const json = await res.json();
  return json.MRData;
}

// ─── STANDINGS ────────────────────────────────

export async function getDriverStandings(season = SEASON) {
  const data = await fetchF1(`/${season}/driverStandings`);
  const list = data.StandingsTable?.StandingsLists?.[0];
  if (!list) return { season, round: 0, drivers: [] };

  return {
    season,
    round: parseInt(list.round),
    drivers: list.DriverStandings.map((d) => ({
      pos: parseInt(d.position),
      posText: d.positionText,
      points: parseFloat(d.points),
      wins: parseInt(d.wins),
      driver: {
        id: d.Driver.driverId,
        code: d.Driver.code,
        num: d.Driver.permanentNumber,
        firstName: d.Driver.givenName,
        lastName: d.Driver.familyName,
        name: `${d.Driver.givenName} ${d.Driver.familyName}`,
        nationality: d.Driver.nationality,
        dob: d.Driver.dateOfBirth,
        url: d.Driver.url,
      },
      team: {
        id: d.Constructors?.[0]?.constructorId,
        name: d.Constructors?.[0]?.name,
        nationality: d.Constructors?.[0]?.nationality,
      },
    })),
  };
}

export async function getConstructorStandings(season = SEASON) {
  const data = await fetchF1(`/${season}/constructorStandings`);
  const list = data.StandingsTable?.StandingsLists?.[0];
  if (!list) return { season, round: 0, constructors: [] };

  return {
    season,
    round: parseInt(list.round),
    constructors: list.ConstructorStandings.map((c) => ({
      pos: parseInt(c.position),
      points: parseFloat(c.points),
      wins: parseInt(c.wins),
      team: {
        id: c.Constructor.constructorId,
        name: c.Constructor.name,
        nationality: c.Constructor.nationality,
        url: c.Constructor.url,
      },
    })),
  };
}

// ─── SCHEDULE ─────────────────────────────────

export async function getSchedule(season = SEASON) {
  const data = await fetchF1(`/${season}`);
  const races = data.RaceTable?.Races || [];

  return races.map((r) => ({
    season: r.season,
    round: parseInt(r.round),
    name: r.raceName,
    url: r.url,
    circuit: {
      id: r.Circuit.circuitId,
      name: r.Circuit.circuitName,
      location: r.Circuit.Location.locality,
      country: r.Circuit.Location.country,
      lat: r.Circuit.Location.lat,
      long: r.Circuit.Location.long,
    },
    date: r.date,
    time: r.time,
    fp1: r.FirstPractice   ? { date: r.FirstPractice.date,   time: r.FirstPractice.time   } : null,
    fp2: r.SecondPractice  ? { date: r.SecondPractice.date,  time: r.SecondPractice.time  } : null,
    fp3: r.ThirdPractice   ? { date: r.ThirdPractice.date,   time: r.ThirdPractice.time   } : null,
    sprint: r.Sprint       ? { date: r.Sprint.date,          time: r.Sprint.time          } : null,
    qualifying: r.Qualifying ? { date: r.Qualifying.date,   time: r.Qualifying.time      } : null,
  }));
}

// ─── RACE RESULTS ─────────────────────────────

export async function getRaceResult(season = SEASON, round) {
  const data = await fetchF1(`/${season}/${round}/results`);
  const race = data.RaceTable?.Races?.[0];
  if (!race) return null;

  return {
    season: race.season,
    round: parseInt(race.round),
    name: race.raceName,
    date: race.date,
    circuit: {
      id: race.Circuit.circuitId,
      name: race.Circuit.circuitName,
      location: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
    },
    results: race.Results.map((r) => ({
      pos: parseInt(r.position),
      posText: r.positionText,
      num: r.number,
      points: parseFloat(r.points),
      driver: {
        id: r.Driver.driverId,
        code: r.Driver.code,
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        nationality: r.Driver.nationality,
      },
      team: {
        id: r.Constructor.constructorId,
        name: r.Constructor.name,
      },
      grid: parseInt(r.grid),
      laps: parseInt(r.laps),
      status: r.status,
      time: r.Time?.time || null,
      gap: r.Time?.millis || null,
      fastestLap: r.FastestLap ? {
        rank: parseInt(r.FastestLap.rank),
        lap: parseInt(r.FastestLap.lap),
        time: r.FastestLap.Time?.time,
        speed: r.FastestLap.AverageSpeed?.speed,
      } : null,
    })),
  };
}

// ─── SPRINT RESULTS ───────────────────────────
// Jolpica endpoint: /ergast/f1/{season}/{round}/sprint
// Tersedia untuk round yang punya sprint weekend.
// Catatan: Sprint QUALIFYING (shootout) belum di-expose
// oleh Jolpica — hanya sprint race yang tersedia.

export async function getSprintResult(season = SEASON, round) {
  const data = await fetchF1(`/${season}/${round}/sprint`);
  const race = data.RaceTable?.Races?.[0];
  if (!race) return null;

  return {
    season: race.season,
    round: parseInt(race.round),
    name: race.raceName,
    date: race.date,
    circuit: {
      name: race.Circuit.circuitName,
      location: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
    },
    results: (race.SprintResults || []).map((r) => ({
      pos: parseInt(r.position),
      posText: r.positionText,
      num: r.number,
      points: parseFloat(r.points),
      driver: {
        id: r.Driver.driverId,
        code: r.Driver.code,
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        nationality: r.Driver.nationality,
      },
      team: {
        id: r.Constructor.constructorId,
        name: r.Constructor.name,
      },
      grid: parseInt(r.grid),
      laps: parseInt(r.laps),
      status: r.status,
      time: r.Time?.time || null,
    })),
  };
}

// ─── QUALIFYING RESULTS ───────────────────────

export async function getQualifyingResult(season = SEASON, round) {
  const data = await fetchF1(`/${season}/${round}/qualifying`);
  const race = data.RaceTable?.Races?.[0];
  if (!race) return null;

  return {
    season: race.season,
    round: parseInt(race.round),
    name: race.raceName,
    date: race.date,
    circuit: {
      name: race.Circuit.circuitName,
      location: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
    },
    results: race.QualifyingResults.map((q) => ({
      pos: parseInt(q.position),
      num: q.number,
      driver: {
        id: q.Driver.driverId,
        code: q.Driver.code,
        name: `${q.Driver.givenName} ${q.Driver.familyName}`,
        nationality: q.Driver.nationality,
      },
      team: {
        id: q.Constructor.constructorId,
        name: q.Constructor.name,
      },
      q1: q.Q1 || null,
      q2: q.Q2 || null,
      q3: q.Q3 || null,
    })),
  };
}

// ─── PRACTICE RESULTS ─────────────────────────

export async function getPracticeResult(season = SEASON, round, session = 1) {
  const sessionMap = { 1: "practice/1", 2: "practice/2", 3: "practice/3" };
  const data = await fetchF1(`/${season}/${round}/${sessionMap[session]}`);
  const race = data.RaceTable?.Races?.[0];
  if (!race) return null;

  const practiceKey = ["FirstPractice", "SecondPractice", "ThirdPractice"][session - 1];

  return {
    season: race.season,
    round: parseInt(race.round),
    name: race.raceName,
    session: `FP${session}`,
    date: race[practiceKey]?.date || race.date,
    circuit: {
      name: race.Circuit.circuitName,
      location: race.Circuit.Location.locality,
    },
    results: (race.PracticeResults || []).map((p) => ({
      pos: parseInt(p.position),
      num: p.number,
      driver: {
        id: p.Driver.driverId,
        code: p.Driver.code,
        name: `${p.Driver.givenName} ${p.Driver.familyName}`,
      },
      team: {
        name: p.Constructor.name,
      },
      time: p.Time?.time || null,
      gap: p.Time?.millis || null,
      laps: parseInt(p.laps),
    })),
  };
}

// ─── DRIVER PROFILE ───────────────────────────

export async function getDriverProfile(driverId, season = SEASON) {
  const driverData = await fetchF1(`/drivers/${driverId}`);
  const driver = driverData.DriverTable?.Drivers?.[0];
  if (!driver) return null;

  const resultsData = await fetchF1(`/${season}/drivers/${driverId}/results`);
  const races = resultsData.RaceTable?.Races || [];

  const standingsData = await fetchF1(`/${season}/drivers/${driverId}/driverStandings`);
  const standingsList = standingsData.StandingsTable?.StandingsLists?.[0];
  const standing = standingsList?.DriverStandings?.[0];

  let headshotUrl = null;
  try {
    const openf1Drivers = await fetch(
      `https://api.openf1.org/v1/drivers?session_key=latest`,
      { next: { revalidate: 86400 } }
    ).then(r => r.json());
    const match = openf1Drivers.find(d =>
      d.name_acronym?.toLowerCase() === driver.code?.toLowerCase() ||
      d.last_name?.toLowerCase() === driver.familyName?.toLowerCase()
    );
    headshotUrl = match?.headshot_url || null;
  } catch {}

  return {
    id: driver.driverId,
    code: driver.code,
    num: driver.permanentNumber,
    firstName: driver.givenName,
    lastName: driver.familyName,
    name: `${driver.givenName} ${driver.familyName}`,
    nationality: driver.nationality,
    dob: driver.dateOfBirth,
    url: driver.url,
    headshotUrl,
    currentTeam: standing?.Constructors?.[0]?.name || "N/A",
    season: {
      pos: standing ? parseInt(standing.position) : null,
      points: standing ? parseFloat(standing.points) : 0,
      wins: standing ? parseInt(standing.wins) : 0,
    },
    raceResults: races.map((r) => ({
      round: parseInt(r.round),
      name: r.raceName,
      date: r.date,
      pos: parseInt(r.Results?.[0]?.position),
      posText: r.Results?.[0]?.positionText,
      grid: parseInt(r.Results?.[0]?.grid),
      points: parseFloat(r.Results?.[0]?.points),
      status: r.Results?.[0]?.status,
    })),
  };
}

// ─── LAP TIMES ────────────────────────────────

export async function getLapTimes(season = SEASON, round, lap = null) {
  const path = lap
    ? `/${season}/${round}/laps/${lap}`
    : `/${season}/${round}/laps`;
  const data = await fetchF1(path);
  const race = data.RaceTable?.Races?.[0];
  if (!race) return null;

  return {
    round: parseInt(race.round),
    name: race.raceName,
    laps: race.Laps?.map((l) => ({
      lapNum: parseInt(l.number),
      timings: l.Timings.map((t) => ({
        driverId: t.driverId,
        pos: parseInt(t.position),
        time: t.time,
      })),
    })) || [],
  };
}

// ─── PIT STOPS ────────────────────────────────

export async function getPitStops(season = SEASON, round) {
  const data = await fetchF1(`/${season}/${round}/pitstops`);
  const race = data.RaceTable?.Races?.[0];
  if (!race) return null;

  return {
    round: parseInt(race.round),
    name: race.raceName,
    pitStops: race.PitStops?.map((p) => ({
      driverId: p.driverId,
      lap: parseInt(p.lap),
      stop: parseInt(p.stop),
      time: p.time,
      duration: p.duration,
    })) || [],
  };
}