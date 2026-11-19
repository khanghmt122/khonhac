import express from 'express';
import cors from 'cors';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import {
  createUser,
  findUserByEmailOrUsername,
  findOrCreateGoogleUser,
  verifyPassword,
  createSession,
  getUserByToken,
  deleteSession,
  getUserLikes,
  toggleUserLike,
  getUserPlaylists,
  createUserPlaylist,
  getAllDownloads,
  saveDownload,
  removeDownload,
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Setup Downloads directory
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}
app.use('/downloads', express.static(downloadsDir));

// Auth Middleware (extracts user if Bearer token present)
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = getUserByToken(token);
    if (user) {
      req.user = user;
      req.token = token;
    }
  }
  next();
}
app.use(authMiddleware);

// Helper for https GET
function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', ...headers } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(6000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(6000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// ==========================================
// AUTHENTICATION ROUTES (KhoNhac Accounts)
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ tên người dùng, email và mật khẩu' });
  }

  if (username.length < 2) {
    return res.status(400).json({ error: 'Tên người dùng phải có ít nhất 2 ký tự' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  const existing = findUserByEmailOrUsername(email) || findUserByEmailOrUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Tên người dùng hoặc email đã tồn tại trên KhoNhac' });
  }

  try {
    const user = createUser(username.trim(), email.trim(), password);
    const token = createSession(user.id);
    res.json({ success: true, user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Đăng ký tài khoản thất bại' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập email/tên tài khoản và mật khẩu' });
  }

  const user = findUserByEmailOrUsername(emailOrUsername.trim());
  if (!user) {
    return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác' });
  }

  const isValid = verifyPassword(password, user.password_hash, user.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác' });
  }

  const token = createSession(user.id);
  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    created_at: user.created_at,
  };

  res.json({ success: true, user: safeUser, token });
});

// POST /api/auth/google
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar } = req.body;
  const userEmail = email || `user_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;
  const userName = name || 'Google_User';
  try {
    const result = findOrCreateGoogleUser(userEmail, userName, avatar);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Đăng nhập Google thất bại' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  res.json({ user: req.user });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  if (req.token) {
    deleteSession(req.token);
  }
  res.json({ success: true });
});

// ==========================================
// USER DATABASE DATA ROUTES
// ==========================================

// GET /api/user/likes - Get user's liked tracks
app.get('/api/user/likes', (req, res) => {
  if (!req.user) {
    return res.json({ tracks: [] });
  }
  const tracks = getUserLikes(req.user.id);
  res.json({ tracks });
});

// POST /api/user/likes/toggle - Toggle liked track in DB
app.post('/api/user/likes/toggle', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Cần đăng nhập để lưu bài hát yêu thích vào cơ sở dữ liệu' });
  }
  const { track } = req.body;
  if (!track || !track.id) return res.status(400).json({ error: 'Missing track' });

  const result = toggleUserLike(req.user.id, track);
  res.json(result);
});

// GET /api/user/playlists - Get user's created playlists
app.get('/api/user/playlists', (req, res) => {
  if (!req.user) {
    return res.json({ playlists: [] });
  }
  const playlists = getUserPlaylists(req.user.id);
  res.json({ playlists });
});

// POST /api/user/playlists/create - Create playlist
app.post('/api/user/playlists/create', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Cần đăng nhập để tạo danh sách phát' });
  }
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Vui lòng đặt tên cho danh sách phát' });

  const playlist = createUserPlaylist(req.user.id, name.trim(), description || '');
  res.json({ success: true, playlist });
});

// ==========================================
// OFFLINE DOWNLOAD ROUTES
// ==========================================

const YTDLP_BIN = process.env.YTDLP_PATH || (fs.existsSync('/Users/khanghmt122/Library/Python/3.9/bin/yt-dlp') ? '/Users/khanghmt122/Library/Python/3.9/bin/yt-dlp' : 'yt-dlp');

// GET /api/downloaded - List all offline tracks from DB
app.get('/api/downloaded', (req, res) => {
  const list = getAllDownloads();
  // Filter out any where local file was deleted
  const valid = list.filter(t => {
    if (!t.filename) return false;
    return fs.existsSync(path.join(downloadsDir, t.filename));
  });
  res.json({ tracks: valid });
});

// POST /api/download - Download track locally
app.post('/api/download', async (req, res) => {
  const { track } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: 'Missing track data' });
  }

  const existingDownloads = getAllDownloads();
  const existing = existingDownloads.find(t => t.id === track.id);
  if (existing && fs.existsSync(path.join(downloadsDir, existing.filename))) {
    return res.json({ success: true, alreadyDownloaded: true, track: existing });
  }

  const sanitizedQuery = `${track.title} ${track.artist}`.replace(/["'$`\\]/g, '');
  const outPattern = path.join(downloadsDir, `${track.id}.%(ext)s`);

  const cmd = `"${YTDLP_BIN}" --extractor-args "youtube:player_client=android" -f "18/ba[ext=m4a]" -o "${outPattern}" "ytsearch1:${sanitizedQuery} audio"`;

  console.log(`[KhoNhac Download] Downloading: "${track.title}" (${track.id})...`);
  exec(cmd, { timeout: 45000 }, (error) => {
    if (error) {
      console.error(`[Download Error]`, error.message);
      return res.status(500).json({ error: 'Download failed', details: error.message });
    }

    const files = fs.readdirSync(downloadsDir);
    const targetFile = files.find(f => f.startsWith(`${track.id}.`));

    if (!targetFile) {
      return res.status(500).json({ error: 'Target file not created' });
    }

    const stat = fs.statSync(path.join(downloadsDir, targetFile));
    const fileSize = (stat.size / (1024 * 1024)).toFixed(2) + ' MB';
    const localUrl = `/downloads/${targetFile}`;

    // Save to SQLite
    saveDownload(track, targetFile, localUrl, fileSize);

    const downloadedItem = {
      ...track,
      filename: targetFile,
      localUrl,
      fileSize,
      downloadedAt: new Date().toISOString(),
      isOffline: true,
    };

    console.log(`[KhoNhac Download] Saved: ${targetFile} (${fileSize})`);
    res.json({ success: true, track: downloadedItem });
  });
});

// POST /api/download/delete - Delete downloaded track
app.post('/api/download/delete', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const existingDownloads = getAllDownloads();
  const target = existingDownloads.find(t => t.id === id);

  if (target && target.filename) {
    const fPath = path.join(downloadsDir, target.filename);
    if (fs.existsSync(fPath)) {
      try {
        fs.unlinkSync(fPath);
      } catch (e) {
        console.error('Failed to unlink:', e);
      }
    }
  }

  removeDownload(id);
  res.json({ success: true, id });
});

// ==========================================
// MUSIC STREAMING & SEARCH ROUTES
// ==========================================

// Chart / Top 50 Global
app.get('/api/chart', async (req, res) => {
  try {
    const data = await fetchJSON('https://api.deezer.com/chart/0/tracks?limit=50');
    const tracks = (data.data || []).map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist.name,
      album: t.album.title,
      cover: t.album.cover_big || t.album.cover_medium,
      duration: t.duration,
      preview: t.preview,
      rank: t.rank,
    }));
    res.json({ tracks });
  } catch (err) {
    console.error('Chart error:', err);
    res.status(500).json({ error: 'Failed to fetch charts' });
  }
});

// Search
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ tracks: [] });

  try {
    const data = await fetchJSON(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=30`);
    const tracks = (data.data || []).map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist.name,
      album: t.album.title,
      cover: t.album.cover_big || t.album.cover_medium,
      duration: t.duration,
      preview: t.preview,
      rank: t.rank,
    }));
    res.json({ tracks });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Curated Playlists
app.get('/api/playlist/:tag', async (req, res) => {
  const tag = req.params.tag;
  const queries = {
    'top-hits': 'Today Top Hits 2024',
    'vietnam-top': 'V-Pop Hits Son Tung M-TP Wren Evans',
    'chill': 'Lofi Chill Study Beats',
    'rap-caviar': 'Rap Hip Hop Hits Drake Kendrick Lamar',
    'pop-rising': 'Pop Rising Sabrina Carpenter Billie Eilish',
    'focus': 'Deep Focus Classical Piano Ambient',
  };

  const searchQuery = queries[tag] || tag;
  try {
    const data = await fetchJSON(`https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=25`);
    const tracks = (data.data || []).map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist.name,
      album: t.album.title,
      cover: t.album.cover_big || t.album.cover_medium,
      duration: t.duration,
      preview: t.preview,
      rank: t.rank,
    }));
    res.json({ tracks });
  } catch (err) {
    console.error('Playlist error:', err);
    res.status(500).json({ error: 'Failed to load playlist' });
  }
});

// Resolve YouTube Audio
const ytCache = new Map();
app.get('/api/yt-stream', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  if (ytCache.has(q)) {
    return res.json({ videoId: ytCache.get(q) });
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' official audio')}`;
    const html = await fetchHTML(searchUrl);
    const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
    
    if (matches && matches.length > 0) {
      const videoId = matches[0][1];
      ytCache.set(q, videoId);
      return res.json({ videoId });
    }
    res.status(404).json({ error: 'Video not found' });
  } catch (err) {
    console.error('YT resolve error:', err);
    res.status(500).json({ error: 'Failed to resolve YouTube ID' });
  }
});

// Lyrics from LRCLIB
app.get('/api/lyrics', async (req, res) => {
  const { artist, track } = req.query;
  if (!artist || !track) return res.json({ lines: [] });

  try {
    const cleanTrack = track.replace(/\(.*?\)|\[.*?\]/g, '').trim();
    const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(cleanTrack)}`;
    const data = await fetchJSON(url, { 'User-Agent': 'KhoNhac/1.0' });

    if (data && data.syncedLyrics) {
      const lines = [];
      const rawLines = data.syncedLyrics.split('\n');
      for (const line of rawLines) {
        const match = line.match(/\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/);
        if (match) {
          const min = parseInt(match[1], 10);
          const sec = parseFloat(match[2]);
          const time = min * 60 + sec;
          const text = match[3].trim();
          if (text) {
            lines.push({ time, text });
          }
        }
      }
      return res.json({ lines });
    } else if (data && data.plainLyrics) {
      const lines = data.plainLyrics.split('\n').filter(l => l.trim()).map((text, i) => ({
        time: i * 4,
        text: text.trim()
      }));
      return res.json({ lines });
    }
    res.json({ lines: [] });
  } catch (err) {
    res.json({ lines: [] });
  }
});

// Serve frontend static build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎵 KHONHAC (Music & Database Platform) is LIVE!`);
  console.log(`🚀 Local URL: http://localhost:${PORT}`);
  console.log(`💾 SQLite Database: ${path.join(__dirname, 'khonhac.db')}`);
  console.log(`======================================================\n`);
});
