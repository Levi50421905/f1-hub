// public/sw.js
// F1 Hub Service Worker — v4
// Fix: window notifikasi diperlebar 10 mnt → 2 jam, Race Week key dicek

const CACHE = "f1hub-v4";
const PRECACHE = ["/", "/standings", "/schedule", "/drivers"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

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

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};
  if (type === "SKIP_WAITING") { self.skipWaiting(); return; }
  if (type === "SAVE_SCHEDULES") {
    saveSchedulesToIDB(payload.schedules)
      .then(() => checkAndFireNotifications())
      .then(() => { event.source?.postMessage({ type: "SCHEDULES_SAVED" }); });
    return;
  }
  if (type === "CHECK_NOTIFICATIONS") { checkAndFireNotifications(); return; }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "f1-notif-check") {
    event.waitUntil(checkAndFireNotifications());
  }
});


// ─── PUSH EVENT (dari server) ────────────────────────────────
// Ini yang dipanggil saat server kirim push — PASTI muncul
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body:  data.body,
        icon:  data.icon  || "/icons/icon-192.png",
        badge: data.badge || "/icons/badge-72.png",
        tag:   data.tag   || "f1-push",
        data:  { url: data.url || "/" },
        renotify: false,
      })
    );
  } catch (err) {
    console.error("[SW] Push parse error:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) clients[0].focus();
      else self.clients.openWindow("/");
    })
  );
});

// ── IndexedDB ──────────────────────────────────────────────

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("f1hub-notif", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("schedules"))
        db.createObjectStore("schedules", { keyPath: "key" });
      if (!db.objectStoreNames.contains("fired"))
        db.createObjectStore("fired", { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveSchedulesToIDB(schedules) {
  const db = await openIDB();
  const tx = db.transaction("schedules", "readwrite");
  const store = tx.objectStore("schedules");
  await new Promise((res, rej) => { const r = store.clear(); r.onsuccess = res; r.onerror = rej; });
  for (const s of schedules) {
    await new Promise((res, rej) => { const r = store.put(s); r.onsuccess = res; r.onerror = rej; });
  }
}

async function getAllSchedules() {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("schedules", "readonly");
    const req = tx.objectStore("schedules").getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function isFired(key) {
  const db = await openIDB();
  return new Promise((resolve) => {
    const tx = db.transaction("fired", "readonly");
    const req = tx.objectStore("fired").get(key);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => resolve(false);
  });
}

async function markFired(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("fired", "readwrite");
    const req = tx.objectStore("fired").put({ key, firedAt: Date.now() });
    req.onsuccess = resolve;
    req.onerror = reject;
  });
}

// ── Core: cek dan tembak notifikasi ───────────────────────

async function checkAndFireNotifications() {
  const now = Date.now();
  const schedules = await getAllSchedules();

  for (const schedule of schedules) {
    const { key, fireAt, title, body, icon } = schedule;

    // Belum waktunya
    if (fireAt > now) continue;

    // DIPERLEBAR: toleransi 2 jam keterlambatan (dari 10 menit)
    // Periodic sync tidak tepat waktu — HP bisa tunda sampai 1-2 jam
    if (now - fireAt > 2 * 60 * 60 * 1000) continue;

    // Sudah pernah ditembak
    if (await isFired(key)) continue;

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