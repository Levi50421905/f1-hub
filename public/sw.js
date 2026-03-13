// public/sw.js
// F1 Hub Service Worker — v3
// Fitur: caching + scheduled notifications (hanya untuk PWA installed)

const CACHE = "f1hub-v3";
const PRECACHE = ["/", "/standings", "/schedule", "/drivers"];

// ─── INSTALL ────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ─── ACTIVATE ───────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── FETCH (Network first) ───────────────────────────────────
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ─── MESSAGE HANDLER ─────────────────────────────────────────
// Terima pesan dari PWAProvider/NotifSettings
self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  // Simpan jadwal notifikasi ke IndexedDB
  if (type === "SAVE_SCHEDULES") {
    saveSchedulesToIDB(payload.schedules)
      .then(() => checkAndFireNotifications())
      .then(() => {
        event.source?.postMessage({ type: "SCHEDULES_SAVED" });
      });
    return;
  }

  // Trigger manual check (dipanggil saat app dibuka)
  if (type === "CHECK_NOTIFICATIONS") {
    checkAndFireNotifications();
    return;
  }
});

// ─── PERIODIC SYNC ──────────────────────────────────────────
// Background sync setiap jam (butuh periodicSync permission)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "f1-notif-check") {
    event.waitUntil(checkAndFireNotifications());
  }
});

// ─── NOTIFICATION CLICK ──────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow("/");
      }
    })
  );
});

// ═══════════════════════════════════════════════════════════
// INDEXED DB HELPERS
// ═══════════════════════════════════════════════════════════

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("f1hub-notif", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("schedules")) {
        db.createObjectStore("schedules", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("fired")) {
        db.createObjectStore("fired", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveSchedulesToIDB(schedules) {
  const db = await openIDB();
  const tx = db.transaction("schedules", "readwrite");
  const store = tx.objectStore("schedules");

  // Clear lama, simpan baru
  await new Promise((res, rej) => {
    const clearReq = store.clear();
    clearReq.onsuccess = res;
    clearReq.onerror = rej;
  });

  for (const schedule of schedules) {
    await new Promise((res, rej) => {
      const addReq = store.put(schedule);
      addReq.onsuccess = res;
      addReq.onerror = rej;
    });
  }
}

async function getAllSchedules() {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("schedules", "readonly");
    const store = tx.objectStore("schedules");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function isFired(key) {
  const db = await openIDB();
  return new Promise((resolve) => {
    const tx = db.transaction("fired", "readonly");
    const store = tx.objectStore("fired");
    const req = store.get(key);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => resolve(false);
  });
}

async function markFired(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("fired", "readwrite");
    const store = tx.objectStore("fired");
    const req = store.put({ key, firedAt: Date.now() });
    req.onsuccess = resolve;
    req.onerror = reject;
  });
}

// ═══════════════════════════════════════════════════════════
// CORE: CEK DAN TEMBAK NOTIFIKASI
// ═══════════════════════════════════════════════════════════

async function checkAndFireNotifications() {
  const now = Date.now();
  const schedules = await getAllSchedules();

  for (const schedule of schedules) {
    const { key, fireAt, title, body, icon } = schedule;

    // Sudah lewat atau lebih dari 10 menit terlambat → skip
    const diff = now - fireAt;
    if (diff < 0 || diff > 10 * 60 * 1000) continue;

    // Sudah pernah ditembak → skip
    const fired = await isFired(key);
    if (fired) continue;

    // Tembak notifikasi!
    await self.registration.showNotification(title, {
      body,
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      tag: key,
      renotify: false,
      requireInteraction: false,
      data: { url: "/" },
    });

    await markFired(key);
  }
}