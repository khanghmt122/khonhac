import React, { useEffect, useRef } from 'react';
import { X, Mic2, Disc3 } from 'lucide-react';

export default function LyricsModal({
  isOpen,
  onClose,
  lyricsLines,
  currentTime,
  currentTrack,
  onSeekTo,
}) {
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Find active line based on currentTime
  let activeIndex = -1;
  for (let i = 0; i < lyricsLines.length; i++) {
    if (currentTime >= lyricsLines[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Auto-scroll to center active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current && isOpen) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1e3264]/95 via-[#121212]/98 to-black backdrop-blur-xl flex flex-col p-8 overflow-hidden select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <img
            src={currentTrack?.cover}
            alt={currentTrack?.title}
            className="w-14 h-14 rounded-lg object-cover shadow-xl"
          />
          <div>
            <h2 className="text-xl font-black text-white truncate">{currentTrack?.title}</h2>
            <p className="text-sm font-semibold text-white/70">{currentTrack?.artist}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics Scrollable Container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto py-20 px-4 md:px-16 space-y-8 scroll-smooth">
        {lyricsLines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-white/60 space-y-4">
            <Mic2 className="w-16 h-16 opacity-40 animate-pulse" />
            <p className="text-2xl font-bold">Chưa tìm thấy lời bài hát khớp thời gian</p>
            <p className="text-sm">Hãy thưởng thức giai điệu cùng Spotify c4 Edition!</p>
          </div>
        ) : (
          lyricsLines.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeekTo(line.time)}
                className={`transition-all duration-300 cursor-pointer font-extrabold leading-relaxed ${
                  isActive
                    ? 'text-white text-3xl sm:text-4xl scale-100 opacity-100 drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]'
                    : isPast
                    ? 'text-white/40 text-2xl sm:text-3xl hover:text-white/70'
                    : 'text-white/25 text-2xl sm:text-3xl hover:text-white/60'
                }`}
              >
                {line.text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
}
