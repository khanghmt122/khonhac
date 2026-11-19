import React from 'react';
import { Play } from 'lucide-react';

export default function HomeView({
  chartTracks,
  vietnamTracks,
  chillTracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onSelectPlaylist,
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const quickPicks = [
    { title: "Today's Top Hits", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop", id: "top-hits" },
    { title: "V-Pop Đình Đám", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop", id: "vietnam-top" },
    { title: "Lofi Chill & Relax", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop", id: "chill" },
    { title: "RapCaviar Worldwide", cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&h=300&fit=crop", id: "rap-caviar" },
    { title: "Pop Rising 2025", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop", id: "pop-rising" },
    { title: "Deep Focus Ambient", cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=300&fit=crop", id: "focus" },
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* 1. Header Greeting */}
      <h1 className="text-3xl font-extrabold text-white tracking-tight">{greeting}</h1>

      {/* 2. Quick Picks 6-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickPicks.map((pick, i) => (
          <div
            key={i}
            onClick={() => onSelectPlaylist(pick.id)}
            className="group relative flex items-center bg-[#282828]/60 hover:bg-[#323232] transition-all rounded overflow-hidden cursor-pointer shadow-md"
          >
            <img src={pick.cover} alt={pick.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0" />
            <span className="font-bold text-sm px-4 flex-1 text-white truncate">{pick.title}</span>
            <div className="mr-4 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-lg rounded-full bg-[#1db954] w-12 h-12 flex items-center justify-center shrink-0">
              <Play className="w-6 h-6 text-black fill-black ml-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Section: Top 50 Bảng Xếp Hạng Toàn Cầu */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer">
            Bảng Xếp Hạng Toàn Cầu (Top Hits)
          </h2>
          <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">Hiện tất cả</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {chartTracks.slice(0, 12).map((track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, chartTracks)}
                className="group p-3 bg-[#181818] hover:bg-[#282828] transition-all rounded-lg cursor-pointer flex flex-col relative shadow"
              >
                <div className="relative mb-3 aspect-square rounded-md overflow-hidden bg-[#282828] shadow-md">
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                  <div
                    className={`absolute bottom-2 right-2 rounded-full bg-[#1db954] w-11 h-11 flex items-center justify-center shadow-xl transition-all duration-200 ${
                      isThisPlaying
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105'
                    }`}
                  >
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <h3 className={`font-bold text-sm truncate ${currentTrack?.id === track.id ? 'text-[#1db954]' : 'text-white'}`}>
                  {track.title}
                </h3>
                <p className="text-xs text-[#b3b3b3] truncate mt-1">{track.artist}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Section: V-Pop Nổi Bật (Sơn Tùng, Wren Evans, MCK...) */}
      {vietnamTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer">
              V-Pop Nổi Bật & Thịnh Hành
            </h2>
            <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">Hiện tất cả</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {vietnamTracks.slice(0, 6).map((track) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, vietnamTracks)}
                className="group p-3 bg-[#181818] hover:bg-[#282828] transition-all rounded-lg cursor-pointer flex flex-col relative shadow"
              >
                <div className="relative mb-3 aspect-square rounded-md overflow-hidden bg-[#282828] shadow-md">
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 rounded-full bg-[#1db954] w-11 h-11 flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105">
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <h3 className={`font-bold text-sm truncate ${currentTrack?.id === track.id ? 'text-[#1db954]' : 'text-white'}`}>
                  {track.title}
                </h3>
                <p className="text-xs text-[#b3b3b3] truncate mt-1">{track.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Section: Lofi & Chill */}
      {chillTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer">
              Giai Điệu Chill & Lofi Thư Giãn
            </h2>
            <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">Hiện tất cả</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {chillTracks.slice(0, 6).map((track) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, chillTracks)}
                className="group p-3 bg-[#181818] hover:bg-[#282828] transition-all rounded-lg cursor-pointer flex flex-col relative shadow"
              >
                <div className="relative mb-3 aspect-square rounded-md overflow-hidden bg-[#282828] shadow-md">
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 rounded-full bg-[#1db954] w-11 h-11 flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105">
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <h3 className={`font-bold text-sm truncate ${currentTrack?.id === track.id ? 'text-[#1db954]' : 'text-white'}`}>
                  {track.title}
                </h3>
                <p className="text-xs text-[#b3b3b3] truncate mt-1">{track.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
