import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'khonhac.db');

export const db = new DatabaseSync(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    avatar TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_likes (
    user_id INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    track_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, track_id)
  );

  CREATE TABLE IF NOT EXISTS user_playlists (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover TEXT,
    tracks_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS downloads (
    track_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_size TEXT NOT NULL,
    local_url TEXT NOT NULL,
    track_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Password Hashing Helper
export function hashPassword(password, salt = null) {
  const activeSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, activeSalt, 64).toString('hex');
  return { hash, salt: activeSalt };
}

export function verifyPassword(password, hash, salt) {
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return check === hash;
}

// User Helpers
export function createUser(username, email, password) {
  const { hash, salt } = hashPassword(password);
  const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`;
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, salt, avatar)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(username, email.toLowerCase(), hash, salt, avatar);
  return {
    id: Number(result.lastInsertRowid),
    username,
    email: email.toLowerCase(),
    avatar,
  };
}

export function findUserByEmailOrUsername(identifier) {
  const stmt = db.prepare(`
    SELECT * FROM users
    WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)
  `);
  return stmt.get(identifier, identifier);
}

export function findOrCreateGoogleUser(email, name, avatar) {
  let user = findUserByEmailOrUsername(email);
  if (!user) {
    const { hash, salt } = hashPassword(crypto.randomBytes(16).toString('hex'));
    const safeUsername = name || email.split('@')[0];
    let finalUsername = safeUsername;
    let count = 1;
    while (findUserByEmailOrUsername(finalUsername)) {
      finalUsername = `${safeUsername}_${count++}`;
    }
    const finalAvatar = avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(finalUsername)}`;
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, salt, avatar)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(finalUsername, email.toLowerCase(), hash, salt, finalAvatar);
    user = {
      id: Number(result.lastInsertRowid),
      username: finalUsername,
      email: email.toLowerCase(),
      avatar: finalAvatar,
    };
  }
  const token = createSession(user.id);
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    token,
  };
}

export function getUserById(id) {
  const stmt = db.prepare(`
    SELECT id, username, email, avatar, created_at FROM users WHERE id = ?
  `);
  return stmt.get(id);
}

// Session Helpers
export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id) VALUES (?, ?)
  `);
  stmt.run(token, userId);
  return token;
}

export function getUserByToken(token) {
  if (!token) return null;
  const stmt = db.prepare(`
    SELECT u.id, u.username, u.email, u.avatar, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `);
  return stmt.get(token);
}

export function deleteSession(token) {
  const stmt = db.prepare(`DELETE FROM sessions WHERE token = ?`);
  stmt.run(token);
}

// Likes Helpers
export function getUserLikes(userId) {
  const stmt = db.prepare(`
    SELECT track_json FROM user_likes WHERE user_id = ? ORDER BY created_at DESC
  `);
  const rows = stmt.all(userId);
  return rows.map(r => JSON.parse(r.track_json));
}

export function toggleUserLike(userId, track) {
  const checkStmt = db.prepare(`
    SELECT track_id FROM user_likes WHERE user_id = ? AND track_id = ?
  `);
  const exists = checkStmt.get(userId, track.id);

  if (exists) {
    const del = db.prepare(`
      DELETE FROM user_likes WHERE user_id = ? AND track_id = ?
    `);
    del.run(userId, track.id);
    return { liked: false };
  } else {
    const ins = db.prepare(`
      INSERT INTO user_likes (user_id, track_id, track_json) VALUES (?, ?, ?)
    `);
    ins.run(userId, track.id, JSON.stringify(track));
    return { liked: true };
  }
}

// User Playlists Helpers
export function getUserPlaylists(userId) {
  const stmt = db.prepare(`
    SELECT id, name, description, cover, tracks_json, created_at
    FROM user_playlists WHERE user_id = ? ORDER BY created_at DESC
  `);
  const rows = stmt.all(userId);
  return rows.map(r => ({
    ...r,
    tracks: JSON.parse(r.tracks_json || '[]'),
  }));
}

export function createUserPlaylist(userId, name, description = '') {
  const id = 'pl_' + crypto.randomBytes(8).toString('hex');
  const defaultCovers = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop',
  ];
  const cover = defaultCovers[Math.floor(Math.random() * defaultCovers.length)];
  const stmt = db.prepare(`
    INSERT INTO user_playlists (id, user_id, name, description, cover, tracks_json)
    VALUES (?, ?, ?, ?, ?, '[]')
  `);
  stmt.run(id, userId, name, description, cover);
  return { id, name, description, cover, tracks: [] };
}

// Downloads Helpers
export function getAllDownloads() {
  const stmt = db.prepare(`SELECT * FROM downloads ORDER BY created_at DESC`);
  const rows = stmt.all();
  return rows.map(r => {
    const base = JSON.parse(r.track_json);
    return {
      ...base,
      filename: r.filename,
      localUrl: r.local_url,
      fileSize: r.file_size,
      downloadedAt: r.created_at,
      isOffline: true,
    };
  });
}

export function saveDownload(track, filename, localUrl, fileSize) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO downloads (track_id, title, artist, filename, file_size, local_url, track_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(track.id, track.title, track.artist, filename, fileSize, localUrl, JSON.stringify(track));
}

export function removeDownload(trackId) {
  const stmt = db.prepare(`DELETE FROM downloads WHERE track_id = ?`);
  stmt.run(trackId);
}
