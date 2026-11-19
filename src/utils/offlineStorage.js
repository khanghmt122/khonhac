// KhoNhac Device-Level Offline Storage (IndexedDB + Cache API)
// Saves audio Blobs directly to the user's phone / laptop browser storage

const CACHE_NAME = 'khonhac-audio-cache-v1';
const DB_NAME = 'KhoNhacOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 1. Get all tracks saved locally on this device
export async function getDeviceTracks() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[OfflineStorage] IndexedDB fallback to localStorage:', err);
    try {
      const saved = localStorage.getItem('khonhac_device_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

// 2. Save track metadata & audio blob to user's device
export async function saveTrackToDevice(track) {
  try {
    // A. Trigger server download / retrieve file
    let downloadUrl = track.localUrl;
    let fileSize = track.fileSize || '3.5 MB';

    if (!downloadUrl) {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Server download error');
      downloadUrl = data.track.localUrl;
      fileSize = data.track.fileSize;
    }

    // B. Fetch audio stream as Blob to store inside user device's Cache
    const audioRes = await fetch(downloadUrl);
    if (!audioRes.ok) throw new Error('Failed to fetch audio stream for offline cache');

    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(`/offline-audio/${track.id}`, audioRes.clone());
    }

    // C. Convert cover to base64 so it displays when completely offline
    let offlineCover = track.cover;
    try {
      const imgRes = await fetch(track.cover, { mode: 'cors' });
      if (imgRes.ok) {
        const imgBlob = await imgRes.blob();
        offlineCover = await new Promise((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result);
          reader.readAsDataURL(imgBlob);
        });
      }
    } catch {
      // Keep original url if CORS fails
    }

    const deviceRecord = {
      ...track,
      fileSize,
      cover: offlineCover,
      downloadedAt: new Date().toISOString(),
      isDeviceOffline: true,
      cachedKey: `/offline-audio/${track.id}`,
    };

    // D. Persist to IndexedDB
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(deviceRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Also mirror to localStorage for quick synchronous reads
    const existing = await getDeviceTracks();
    const updated = [deviceRecord, ...existing.filter(t => t.id !== track.id)];
    localStorage.setItem('khonhac_device_tracks', JSON.stringify(updated));

    return deviceRecord;
  } catch (err) {
    console.error('[OfflineStorage] Error saving track to device:', err);
    throw err;
  }
}

// 3. Get playable blob URL for a device-cached track
export async function getDeviceAudioUrl(track) {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(`/offline-audio/${track.id}`);
      if (cached) {
        const blob = await cached.blob();
        return URL.createObjectURL(blob);
      }
    }
  } catch (err) {
    console.warn('[OfflineStorage] Cache match error:', err);
  }

  // Fallback to server localUrl if online
  return track.localUrl || null;
}

// 4. Remove track from user's device
export async function removeTrackFromDevice(trackId) {
  try {
    // Delete from Cache API
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(`/offline-audio/${trackId}`);
    }

    // Delete from IndexedDB
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(trackId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Update localStorage mirror
    const existing = await getDeviceTracks();
    const filtered = existing.filter(t => t.id !== trackId);
    localStorage.setItem('khonhac_device_tracks', JSON.stringify(filtered));
  } catch (err) {
    console.error('[OfflineStorage] Delete error:', err);
  }
}
