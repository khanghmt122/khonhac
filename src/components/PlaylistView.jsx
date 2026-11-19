import React from 'react';
import {
  Play,
  Pause,
  Heart,
  Clock,
  Shuffle,
  ArrowDownCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  HardDriveDownload,
  WifiOff,
} from 'lucide-react';

export default function PlaylistView({
  playlistId,
  playlistTracks,
  currentTrack,
  isPlaying,
  likedSongIds,
  downloadedSongIds = new Set(),
  downloadingIds = new Set(),
  userPlaylists = [],
  onPlayTrack,
  onTogglePlay,
  onToggleLike,
  onToggleDownload,
  onDeleteDownloaded,
}) {
  const userPlMatch = userPlaylists.find(p => p.id === playlistId);

  const metadata = userPlMatch ? {
    title: userPlMatch.name,
    desc: userPlMatch.description || 'Danh sách phát cá nhân của bạn',
    cover: userPlMatch.cover,
    gradient: 'from-[#1e3264] to-[#121212]',
  } : {
    'downloaded': {
      title: 'Nhạc Đã Tải Xuống (Offline)',
      desc: 'Toàn bộ bài hát được lưu trữ trên ổ đĩa máy tính của bạn. Nghe mọi lúc mọi nơi kể cả khi ngắt kết nối Internet.',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
      gradient: 'from-[#056952] to-[#121212]',
      isOfflineCategory: true,
    },
    'liked': {
      title: 'Bài hát đã thích',
      desc: 'Toàn bộ bài hát yêu thích của bạn',
      cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop',
      gradient: 'from-[#450af5] to-[#121212]',
    },
    'top-hits': {
      title: "Today's Top Hits",
      desc: "Những bài hát hot nhất hành tinh hiện tại.",
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      gradient: 'from-[#1e3264] to-[#121212]',
    },
    'vietnam-top': {
      title: 'V-Pop Đình Đám',
      desc: 'Top ca khúc V-Pop làm mưa làm gió thị trường.',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
      gradient: 'from-[#0d5940] to-[#121212]',
    },
    'chill': {
      title: 'Lofi Chill & Relax',
      desc: 'Giai điệu êm dịu, thư giãn và ngủ ngon.',
      cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop',
      gradient: 'from-[#503750] to-[#121212]',
    },
    'rap-caviar': {
      title: 'RapCaviar Worldwide',
      desc: 'Những track Rap Hip Hop cháy nhất thế giới.',
      cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=400&fit=crop',
      gradient: 'from-[#8c1932] to-[#121212]',
    },
    'pop-rising': {
      title: 'Pop Rising 2025',
      desc: 'Những giai điệu pop tươi mới bùng nổ.',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
      gradient: 'from-[#e8115b] to-[#121212]',
    },
    'focus': {
      title: 'Deep Focus Ambient',
      desc: 'Âm thanh tập trung cao độ làm việc và học tập.',
      cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
      gradient: 'from-[#477d95] to-[#121212]',
    },
  }[playlistId] || {
    title: 'Danh sách phát',
    desc: 'Tuyển tập bài hát tuyển chọn',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    gradient: 'from-[#1e3264] to-[#121212]',
  };

  const isCurrentPlaylistPlaying = playlistTracks.some(t => t.id === currentTrack?.id) && isPlaying;

  return (
    <div className="pb-36">
      {/* 1. Giant Hero Banner */}
      <div className={`p-8 bg-gradient-to-b ${metadata.gradient} flex flex-col sm:flex-row items-end gap-6 pt-16`}>
        <img
          src={metadata.cover}
          alt={metadata.title}
          className="w-44 h-44 sm:w-52 sm:h-52 rounded shadow-2xl object-cover shrink-0"
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-white">
              {metadata.isOfflineCategory ? 'Bộ sưu tập cục bộ' : 'Danh sách phát công khai'}
            </span>
            {metadata.isOfflineCategory && (
              <span className="flex items-center gap-1 text-[10px] bg-[#1db954] text-black font-extrabold px-2 py-0.5 rounded-full uppercase">
                <WifiOff className="w-3 h-3" /> Offline Ready
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{metadata.title}</h1>
          <p className="text-sm text-white/80 mt-1 max-w-2xl">{metadata.desc}</p>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mt-2">
            <span>KhoNhac Nền Tảng Âm Nhạc</span>
            <span>•</span>
            <span className="text-[#1db954] font-bold">{playlistTracks.length} bài hát</span>
          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div className="p-6 bg-[#121212] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (isCurrentPlaylistPlaying) {
                onTogglePlay();
              } else if (playlistTracks.length > 0) {
                onPlayTrack(playlistTracks[0], playlistTracks);
              }
            }}
            disabled={playlistTracks.length === 0}
            className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xl text-black disabled:opacity-50"
          >
            {isCurrentPlaylistPlaying ? (
              <Pause className="w-7 h-7 fill-black text-black" />
            ) : (
              <Play className="w-7 h-7 fill-black text-black ml-1" />
            )}
          </button>

          <button className="text-[#b3b3b3] hover:text-white transition-colors" title="Trộn bài">
            <Shuffle className="w-7 h-7" />
          </button>

          <button className="text-[#b3b3b3] hover:text-white transition-colors" title="Thích danh sách">
            <Heart className="w-8 h-8" />
          </button>
        </div>

        {/* Global Download Playlist action */}
        {playlistId !== 'downloaded' && playlistTracks.length > 0 && (
          <button
            onClick={() => {
              // Trigger download for first 5 tracks if not already downloaded
              playlistTracks.slice(0, 5).forEach(t => {
                if (!downloadedSongIds.has(t.id) && !downloadingIds.has(t.id)) {
                  onToggleDownload(t);
                }
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#727272] hover:border-white text-xs font-bold text-white hover:scale-105 transition-all"
          >
            <HardDriveDownload className="w-4 h-4 text-[#1db954]" />
            <span>Tải xuống nghe offline</span>
          </button>
        )}
      </div>

      {/* 3. Tracklist Table */}
      <div className="px-6">
        {playlistTracks.length === 0 ? (
          <div className="text-center py-16 text-[#b3b3b3] space-y-3">
            <HardDriveDownload className="w-12 h-12 mx-auto text-[#4d4d4d]" />
            <div className="text-base font-semibold text-white">Chưa có bài hát nào được tải xuống</div>
            <div className="text-xs max-w-sm mx-auto">
              Bấm vào biểu tượng tải xuống <ArrowDownCircle className="w-3.5 h-3.5 inline text-[#1db954]" /> ở bất kỳ bài hát nào để lưu về nghe ngoại tuyến.
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 text-[#b3b3b3] text-xs font-bold uppercase tracking-wider pb-2 border-b border-[#282828] mb-2 px-4">
              <span className="col-span-1">#</span>
              <span className="col-span-5 sm:col-span-5">Tiêu đề</span>
              <span className="hidden sm:block sm:col-span-3">Album</span>
              <span className="col-span-6 sm:col-span-3 text-right flex justify-end items-center pr-4">
                <Clock className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              {playlistTracks.map((track, idx) => {
                const isThis = currentTrack?.id === track.id;
                const isLiked = likedSongIds.has(track.id);
                const isDownloaded = downloadedSongIds.has(track.id);
                const isDownloading = downloadingIds.has(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track, playlistTracks)}
                    className={`group grid grid-cols-12 items-center p-2.5 px-4 rounded-md cursor-pointer transition-colors ${
                      isThis ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {/* Index / Play icon */}
                    <div className="col-span-1 flex items-center text-sm font-semibold text-[#b3b3b3]">
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <Play className="w-4 h-4 text-white fill-white hidden group-hover:block" />
                    </div>

                    {/* Title + Thumbnail + Artist */}
                    <div className="col-span-5 sm:col-span-5 flex items-center gap-3 min-w-0 pr-4">
                      <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-semibold truncate flex items-center gap-2 ${isThis ? 'text-[#1db954]' : 'text-white'}`}>
                          {track.title}
                          {isDownloaded && (
                            <span className="text-[10px] bg-[#1db954]/20 text-[#1db954] px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                              Offline
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-[#b3b3b3] truncate">{track.artist}</span>
                      </div>
                    </div>

                    {/* Album / File Size */}
                    <div className="hidden sm:block sm:col-span-3 text-sm text-[#b3b3b3] truncate pr-4">
                      {track.fileSize ? (
                        <span className="text-xs text-[#1db954] bg-[#1db954]/10 px-2 py-0.5 rounded font-mono">
                          📁 {track.fileSize}
                        </span>
                      ) : (
                        track.album || track.title
                      )}
                    </div>

                    {/* Action icons + Duration */}
                    <div className="col-span-6 sm:col-span-3 flex items-center justify-end gap-3 text-xs text-[#b3b3b3] pr-4">
                      {/* Download Status Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDownloaded && onDeleteDownloaded) {
                            onDeleteDownloaded(track.id);
                          } else {
                            onToggleDownload(track);
                          }
                        }}
                        className="p-1 rounded-full hover:scale-110 transition-transform"
                        title={
                          isDownloading
                            ? 'Đang tải về...'
                            : isDownloaded
                            ? 'Đã tải xuống offline (Bấm để xóa)'
                            : 'Tải xuống nghe offline'
                        }
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 text-[#1db954] animate-spin" />
                        ) : isDownloaded ? (
                          <CheckCircle2 className="w-4 h-4 text-[#1db954] fill-current" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-[#727272] group-hover:text-white transition-colors" />
                        )}
                      </button>

                      {/* Like button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(track);
                        }}
                        className={`transition-colors ${isLiked ? 'text-[#1db954]' : 'opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-white'}`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1db954]' : ''}`} />
                      </button>

                      {/* Duration */}
                      <span className="w-10 text-right">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
