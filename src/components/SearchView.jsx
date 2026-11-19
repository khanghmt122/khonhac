import React from 'react';
import { Play, Music2 } from 'lucide-react';

export default function SearchView({
  searchQuery,
  searchResults,
  isSearching,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onQuickGenreSearch,
}) {
  const genres = [
    { name: 'Pop', color: 'from-[#8c1932] to-[#e8115b]', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop' },
    { name: 'Hip-Hop', color: 'from-[#bc5900] to-[#e6461a]', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&h=300&fit=crop' },
    { name: 'V-Pop', color: 'from-[#056952] to-[#148a08]', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
    { name: 'K-Pop', color: 'from-[#7358ff] to-[#b02897]', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop' },
    { name: 'Chill & Lofi', color: 'from-[#477d95] to-[#777777]', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop' },
    { name: 'Rock', color: 'from-[#e91429] to-[#770000]', img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop' },
    { name: 'Anime & Gaming', color: 'from-[#503750] to-[#af2896]', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&h=300&fit=crop' },
    { name: 'R&B', color: 'from-[#ba5d07] to-[#d84000]', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop' },
  ];

  const topResult = searchResults[0];

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* 1. If NOT searching: Show Genres Grid */}
      {!searchQuery && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Khám phá tất cả các thể loại</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {genres.map((g, i) => (
              <div
                key={i}
                onClick={() => onQuickGenreSearch(g.name)}
                className={`relative h-44 rounded-xl p-4 overflow-hidden cursor-pointer shadow-lg bg-gradient-to-br ${g.color} hover:scale-[1.02] transition-transform`}
              >
                <span className="font-extrabold text-2xl text-white tracking-tight leading-none block">{g.name}</span>
                <img
                  src={g.img}
                  alt={g.name}
                  className="w-24 h-24 object-cover absolute bottom-0 right-0 translate-x-3 translate-y-2 rotate-[25deg] shadow-2xl rounded"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. If Searching: Show Results */}
      {searchQuery && (
        <div className="space-y-8">
          {isSearching && (
            <div className="flex items-center gap-3 text-[#b3b3b3] text-sm">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tìm kiếm trên toàn thế giới...</span>
            </div>
          )}

          {!isSearching && searchResults.length === 0 && (
            <div className="text-center py-20 text-[#b3b3b3]">
              <p className="text-xl font-bold text-white mb-2">Không tìm thấy kết quả nào cho "{searchQuery}"</p>
              <p className="text-sm">Hãy kiểm tra lại chính tả hoặc thử tìm kiếm nghệ sĩ, bài hát khác.</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <>
              {/* Top Result + Songs Top List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Top Result Card */}
                {topResult && (
                  <div className="lg:col-span-5 flex flex-col space-y-4">
                    <h2 className="text-2xl font-bold text-white">Kết quả hàng đầu</h2>
                    <div
                      onClick={() => onPlayTrack(topResult, searchResults)}
                      className="group relative p-5 bg-[#181818] hover:bg-[#282828] transition-all rounded-lg cursor-pointer flex flex-col gap-4 shadow"
                    >
                      <img
                        src={topResult.cover}
                        alt={topResult.title}
                        className="w-24 h-24 rounded-lg object-cover shadow-lg"
                      />
                      <div>
                        <h3 className="text-2xl font-black text-white truncate group-hover:underline">
                          {topResult.title}
                        </h3>
                        <p className="text-sm text-[#b3b3b3] mt-1">
                          <span className="font-semibold text-white">{topResult.artist}</span> •{' '}
                          <span className="bg-[#242424] text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Bài hát
                          </span>
                        </p>
                      </div>

                      <div className="absolute bottom-5 right-5 rounded-full bg-[#1db954] w-12 h-12 flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105">
                        <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Top 4 Songs List */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <h2 className="text-2xl font-bold text-white">Bài hát</h2>
                  <div className="space-y-1">
                    {searchResults.slice(0, 4).map((track) => {
                      const isCurrent = currentTrack?.id === track.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => onPlayTrack(track, searchResults)}
                          className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                            isCurrent ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                              <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                                {track.title}
                              </span>
                              <span className="text-xs text-[#b3b3b3] truncate">{track.artist}</span>
                            </div>
                          </div>
                          <span className="text-xs text-[#b3b3b3] pr-4">
                            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Grid of All Search Results */}
              <div className="space-y-4 pt-4">
                <h2 className="text-2xl font-bold text-white">Tất cả bài hát</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {searchResults.slice(4).map((track) => (
                    <div
                      key={track.id}
                      onClick={() => onPlayTrack(track, searchResults)}
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
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
