import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  Volume2,
  Volume1,
  VolumeX,
  ArrowDownCircle,
  CheckCircle2,
  Loader2,
  WifiOff,
} from 'lucide-react';

export default function PlayerBar({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode, // 'off' | 'all' | 'one'
  isLyricsOpen,
  isLiked,
  isDownloaded,
  isDownloading,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLyrics,
  onToggleLike,
  onToggleDownload,
}) {
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-20 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between select-none fixed bottom-0 left-0 right-0 z-40">
      {/* 1. Left Track Info */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-14 h-14 rounded object-cover shadow shrink-0"
            />
            <div className="flex flex-col min-w-0 pr-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                  {currentTrack.title}
                </span>
                {(isDownloaded || currentTrack.isOffline) && (
                  <span className="flex items-center gap-0.5 text-[9px] bg-[#1db954] text-black font-extrabold px-1.5 py-0.2 rounded shrink-0 uppercase tracking-tighter" title="Đang phát từ bộ nhớ máy (Không cần internet)">
                    <WifiOff className="w-2.5 h-2.5" /> OFFLINE
                  </span>
                )}
              </div>
              <span className="text-xs text-[#b3b3b3] truncate hover:underline cursor-pointer">
                {currentTrack.artist}
              </span>
            </div>

            {/* Like Button */}
            <button
              onClick={() => onToggleLike(currentTrack)}
              className={`p-1.5 transition-colors shrink-0 ${
                isLiked ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Thích"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#1db954]' : ''}`} />
            </button>

            {/* Quick Download Button in Player */}
            <button
              onClick={() => onToggleDownload && onToggleDownload(currentTrack)}
              className="p-1.5 transition-colors shrink-0"
              title={
                isDownloading
                  ? 'Đang tải về...'
                  : isDownloaded
                  ? 'Đã tải về máy tính'
                  : 'Tải bài này về nghe offline'
              }
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 text-[#1db954] animate-spin" />
              ) : isDownloaded ? (
                <CheckCircle2 className="w-5 h-5 text-[#1db954] fill-current" />
              ) : (
                <ArrowDownCircle className="w-5 h-5 text-[#b3b3b3] hover:text-white" />
              )}
            </button>
          </>
        ) : (
          <div className="text-xs text-[#b3b3b3]">Chọn bài hát để bắt đầu nghe</div>
        )}
      </div>

      {/* 2. Center Player Controls & Progress */}
      <div className="flex flex-col items-center gap-1.5 max-w-xl w-2/4">
        {/* Buttons Row */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleShuffle}
            className={`p-1 transition-colors ${
              isShuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Trộn bài"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevTrack}
            className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
            title="Bài trước"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={!currentTrack}
            className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-black shadow disabled:opacity-50"
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
            title="Bài kế tiếp"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-1 transition-colors ${
              repeatMode !== 'off' ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Lặp lại"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Slider Row */}
        <div className="flex items-center gap-2 w-full text-[11px] font-semibold text-[#b3b3b3]">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1 cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ffffff ${progressPercent}%, #4d4d4d ${progressPercent}%)`,
              }}
            />
          </div>
          <span className="w-10 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right Volume & Tools */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        {/* Lyrics Button */}
        <button
          onClick={onToggleLyrics}
          className={`p-1.5 rounded-full transition-colors ${
            isLyricsOpen ? 'text-[#1db954] bg-[#282828]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Lời bài hát (Karaoke)"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={onToggleMute}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-24 h-1 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ffffff ${
                (isMuted ? 0 : volume) * 100
              }%, #4d4d4d ${(isMuted ? 0 : volume) * 100}%)`,
            }}
          />
        </div>
      </div>
    </footer>
  );
}
