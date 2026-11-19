import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import PlaylistView from './components/PlaylistView';
import PlayerBar from './components/PlayerBar';
import LyricsModal from './components/LyricsModal';
import AudioPlayer from './components/AudioPlayer';
import AuthModal from './components/AuthModal';
import { getDeviceTracks, saveTrackToDevice, removeTrackFromDevice } from './utils/offlineStorage';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState('home'); // 'home' | 'search' | 'playlist'
  const [activePlaylist, setActivePlaylist] = useState(null); // 'top-hits' | 'vietnam-top' | 'chill' | 'downloaded' | etc.

  // Authentication State
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('khonhac_token') || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Media Collections State
  const [chartTracks, setChartTracks] = useState([]);
  const [vietnamTracks, setVietnamTracks] = useState([]);
  const [chillTracks, setChillTracks] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [downloadedTracks, setDownloadedTracks] = useState([]);
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [userPlaylists, setUserPlaylists] = useState([]);

  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('khonhac_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Playback State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([]);

  // Lyrics State
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [lyricsLines, setLyricsLines] = useState([]);

  // Check Auth Token on Mount
  useEffect(() => {
    if (!authToken) return;

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          fetchUserLikes(authToken);
          fetchUserPlaylists(authToken);
        }
      })
      .catch(() => {
        localStorage.removeItem('khonhac_token');
        setAuthToken(null);
        setUser(null);
      });
  }, [authToken]);

  const fetchUserLikes = (token) => {
    fetch('/api/user/likes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.tracks) setLikedSongs(data.tracks);
      })
      .catch(err => console.error('Error fetching likes:', err));
  };

  const fetchUserPlaylists = (token) => {
    fetch('/api/user/playlists', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.playlists) setUserPlaylists(data.playlists);
      })
      .catch(err => console.error('Error fetching playlists:', err));
  };

  // Auth Handlers
  const handleAuthSuccess = (loggedUser, token) => {
    setUser(loggedUser);
    setAuthToken(token);
    localStorage.setItem('khonhac_token', token);
    fetchUserLikes(token);
    fetchUserPlaylists(token);
  };

  const handleLogout = () => {
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem('khonhac_token');
    setAuthToken(null);
    setUser(null);
    setUserPlaylists([]);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Load Device Offline Tracks + Server Downloads on Launch
  const loadOfflineTracks = async () => {
    try {
      // 1. First load tracks saved in browser's local IndexedDB / Cache
      const deviceTracks = await getDeviceTracks();

      // 2. Also fetch server downloads if online
      let serverTracks = [];
      try {
        const res = await fetch('/api/downloaded');
        const data = await res.json();
        if (data.tracks) serverTracks = data.tracks;
      } catch {
        // Offline, use deviceTracks
      }

      // Merge: device tracks take priority
      const mergedMap = new Map();
      serverTracks.forEach(t => mergedMap.set(t.id, t));
      deviceTracks.forEach(t => mergedMap.set(t.id, t));

      setDownloadedTracks(Array.from(mergedMap.values()));
    } catch (err) {
      console.warn('Error loading offline tracks:', err);
    }
  };

  useEffect(() => {
    loadOfflineTracks();
  }, []);

  // Initial Curated Data Fetch
  useEffect(() => {
    // 1. Fetch Global Top Hits
    fetch('/api/chart')
      .then(res => res.json())
      .then(data => {
        if (data.tracks) {
          setChartTracks(data.tracks);
          if (!currentTrack && data.tracks.length > 0) {
            setCurrentTrack(data.tracks[0]);
            setQueue(data.tracks);
          }
        }
      })
      .catch(err => console.error('Error fetching chart:', err));

    // 2. Fetch V-Pop Top Hits
    fetch('/api/playlist/vietnam-top')
      .then(res => res.json())
      .then(data => {
        if (data.tracks) setVietnamTracks(data.tracks);
      })
      .catch(err => console.error('Error fetching V-Pop:', err));

    // 3. Fetch Lofi Chill
    fetch('/api/playlist/chill')
      .then(res => res.json())
      .then(data => {
        if (data.tracks) setChillTracks(data.tracks);
      })
      .catch(err => console.error('Error fetching Chill:', err));
  }, []);

  // Handle Playlist Navigation
  useEffect(() => {
    if (!activePlaylist) return;

    if (activePlaylist === 'downloaded') {
      setPlaylistTracks(downloadedTracks);
      return;
    }

    if (activePlaylist === 'liked') {
      setPlaylistTracks(likedSongs);
      return;
    }

    // Check if custom user playlist
    const customMatch = userPlaylists.find(p => p.id === activePlaylist);
    if (customMatch) {
      setPlaylistTracks(customMatch.tracks || []);
      return;
    }

    fetch(`/api/playlist/${activePlaylist}`)
      .then(res => res.json())
      .then(data => {
        if (data.tracks) setPlaylistTracks(data.tracks);
      })
      .catch(err => console.error('Error fetching playlist:', err));
  }, [activePlaylist, likedSongs, downloadedTracks, userPlaylists]);

  // Handle Search Input Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.tracks || []);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Synced Lyrics when currentTrack changes
  useEffect(() => {
    if (!currentTrack) {
      setLyricsLines([]);
      return;
    }

    fetch(`/api/lyrics?artist=${encodeURIComponent(currentTrack.artist)}&track=${encodeURIComponent(currentTrack.title)}`)
      .then(res => res.json())
      .then(data => {
        setLyricsLines(data.lines || []);
      })
      .catch(() => setLyricsLines([]));
  }, [currentTrack]);

  // Playback Control Handlers
  const handlePlayTrack = (track, newQueue = null) => {
    const offlineMatch = downloadedTracks.find(t => t.id === track.id);
    const targetTrack = offlineMatch ? { ...track, ...offlineMatch, isOffline: true } : track;

    setCurrentTrack(targetTrack);
    setIsPlaying(true);
    setSeekTime(0);
    setCurrentTime(0);
    if (newQueue) {
      setQueue(newQueue);
    }
  };

  const handleTogglePlay = () => {
    if (!currentTrack && chartTracks.length > 0) {
      handlePlayTrack(chartTracks[0], chartTracks);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (queue.length === 0) return;
    if (repeatMode === 'one') {
      setSeekTime(0);
      return;
    }

    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * queue.length);
      handlePlayTrack(queue[randIdx]);
      return;
    }

    const currIdx = queue.findIndex(t => t.id === currentTrack?.id);
    if (currIdx >= 0 && currIdx < queue.length - 1) {
      handlePlayTrack(queue[currIdx + 1]);
    } else if (repeatMode === 'all') {
      handlePlayTrack(queue[0]);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevTrack = () => {
    if (currentTime > 3) {
      setSeekTime(0);
      return;
    }
    if (queue.length === 0) return;

    const currIdx = queue.findIndex(t => t.id === currentTrack?.id);
    if (currIdx > 0) {
      handlePlayTrack(queue[currIdx - 1]);
    } else {
      setSeekTime(0);
    }
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
    setSeekTime(newTime);
  };

  // Like Track Handler with SQLite DB Syncing
  const handleToggleLike = async (track) => {
    const isCurrentlyLiked = likedSongs.some(t => t.id === track.id);

    if (isCurrentlyLiked) {
      setLikedSongs(likedSongs.filter(t => t.id !== track.id));
    } else {
      setLikedSongs([track, ...likedSongs]);
    }

    if (authToken) {
      try {
        await fetch('/api/user/likes/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ track }),
        });
      } catch (err) {
        console.error('Failed to sync like with DB:', err);
      }
    } else {
      localStorage.setItem('khonhac_liked_songs', JSON.stringify(
        isCurrentlyLiked ? likedSongs.filter(t => t.id !== track.id) : [track, ...likedSongs]
      ));
    }
  };

  // Create Playlist in Database
  const handleCreatePlaylist = async (name) => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }

    try {
      const res = await fetch('/api/user/playlists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success && data.playlist) {
        setUserPlaylists([data.playlist, ...userPlaylists]);
        setActivePlaylist(data.playlist.id);
        setActiveView('playlist');
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
    }
  };

  // Offline Download Handler (Saves to user's device storage!)
  const handleToggleDownload = async (track) => {
    if (!track || !track.id) return;
    if (downloadingIds.has(track.id)) return;

    setDownloadingIds(prev => new Set(prev).add(track.id));

    try {
      // Save directly to user's device (IndexedDB + Cache API)
      const savedTrack = await saveTrackToDevice(track);

      setDownloadedTracks(prev => {
        const filtered = prev.filter(t => t.id !== track.id);
        return [savedTrack, ...filtered];
      });

      if (currentTrack?.id === track.id) {
        setCurrentTrack(prev => ({ ...prev, ...savedTrack, isOffline: true }));
      }
    } catch (err) {
      console.error('Download to device failed:', err);
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  // Delete Offline Track from user's device
  const handleDeleteDownloaded = async (id) => {
    try {
      await removeTrackFromDevice(id);
      setDownloadedTracks(prev => prev.filter(t => t.id !== id));
      if (currentTrack?.id === id) {
        setCurrentTrack(prev => ({ ...prev, isOffline: false, isDeviceOffline: false }));
      }
    } catch (err) {
      console.error('Failed to delete download from device:', err);
    }
  };

  const likedSongIds = new Set(likedSongs.map(t => t.id));
  const downloadedSongIds = new Set(downloadedTracks.map(t => t.id));

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans select-none">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activePlaylist={activePlaylist}
        setActivePlaylist={setActivePlaylist}
        likedSongsCount={likedSongs.length}
        downloadedCount={downloadedTracks.length}
        userPlaylists={userPlaylists}
        onCreatePlaylist={handleCreatePlaylist}
      />

      {/* 2. Main Scrollable Container */}
      <main className="flex-1 bg-[#121212] rounded-lg my-2 mr-2 overflow-y-auto flex flex-col relative shadow-inner">
        <TopBar
          activeView={activeView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onNavigateHome={() => {
            setActiveView('home');
            setActivePlaylist(null);
          }}
        />

        {/* View Switching */}
        {activeView === 'home' && (
          <HomeView
            chartTracks={chartTracks}
            vietnamTracks={vietnamTracks}
            chillTracks={chillTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onSelectPlaylist={(id) => {
              setActivePlaylist(id);
              setActiveView('playlist');
            }}
          />
        )}

        {activeView === 'search' && (
          <SearchView
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onQuickGenreSearch={(genre) => {
              setSearchQuery(genre);
            }}
          />
        )}

        {activeView === 'playlist' && (
          <PlaylistView
            playlistId={activePlaylist}
            playlistTracks={playlistTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            likedSongIds={likedSongIds}
            downloadedSongIds={downloadedSongIds}
            downloadingIds={downloadingIds}
            userPlaylists={userPlaylists}
            onPlayTrack={handlePlayTrack}
            onTogglePlay={handleTogglePlay}
            onToggleLike={handleToggleLike}
            onToggleDownload={handleToggleDownload}
            onDeleteDownloaded={handleDeleteDownloaded}
          />
        )}
      </main>

      {/* 3. Bottom Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        isLyricsOpen={isLyricsOpen}
        isLiked={likedSongIds.has(currentTrack?.id)}
        isDownloaded={downloadedSongIds.has(currentTrack?.id) || currentTrack?.isOffline}
        isDownloading={downloadingIds.has(currentTrack?.id)}
        onTogglePlay={handleTogglePlay}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => {
          if (repeatMode === 'off') setRepeatMode('all');
          else if (repeatMode === 'all') setRepeatMode('one');
          else setRepeatMode('off');
        }}
        onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
        onToggleLike={handleToggleLike}
        onToggleDownload={handleToggleDownload}
      />

      {/* 4. Fullscreen / Karaoke Lyrics Modal */}
      <LyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        lyricsLines={lyricsLines}
        currentTime={currentTime}
        currentTrack={currentTrack}
        onSeekTo={(time) => {
          handleSeek(time);
        }}
      />

      {/* 5. Dual Audio Streaming & Offline Engine */}
      <AudioPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        volume={isMuted ? 0 : volume}
        seekTime={seekTime}
        onTimeUpdate={(curr, dur) => {
          setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
        }}
        onEnded={handleNextTrack}
      />

      {/* 6. Spotify Authentic Auth Modal (KhoNhac Accounts) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
