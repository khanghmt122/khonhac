import React, { useState } from 'react';
import { Home, Search, Library, Plus, Heart, ArrowDownCircle, Disc3, FolderPlus } from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  activePlaylist,
  setActivePlaylist,
  likedSongsCount,
  downloadedCount = 0,
  userPlaylists = [],
  onCreatePlaylist,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlName, setNewPlName] = useState('');

  const publicPlaylists = [
    { id: 'top-hits', name: "Today's Top Hits", desc: "Taylor Swift, The Weeknd, Billie Eilish", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop" },
    { id: 'vietnam-top', name: "V-Pop Đình Đám", desc: "Sơn Tùng M-TP, Wren Evans, MCK, HIEUTHUHAI", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
    { id: 'chill', name: "Lofi Chill & Relax", desc: "Giai điệu êm dịu, thư giãn và ngủ ngon", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop" },
    { id: 'rap-caviar', name: "RapCaviar Worldwide", desc: "Kendrick Lamar, Drake, Travis Scott, 21 Savage", cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&h=300&fit=crop" },
    { id: 'pop-rising', name: "Pop Rising 2025", desc: "Những bản hit pop bùng nổ toàn cầu", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
    { id: 'focus', name: "Deep Focus Ambient", desc: "Âm thanh tập trung cao độ làm việc và học tập", cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=300&fit=crop" },
  ];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newPlName.trim()) return;
    onCreatePlaylist(newPlName.trim());
    setNewPlName('');
    setIsCreating(false);
  };

  return (
    <aside className="w-64 bg-black flex flex-col gap-2 p-2 select-none h-full shrink-0">
      {/* 1. Top Navigation Card (Brand KhoNhac) */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-5">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer px-2"
          onClick={() => {
            setActiveView('home');
            setActivePlaylist(null);
          }}
        >
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg shadow-[#1db954]/20">
            <Disc3 className="w-5 h-5 text-black animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <span className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
            KhoNhac <span className="text-[10px] bg-[#1db954] text-black font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Free</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-3 font-semibold text-sm">
          <button
            onClick={() => {
              setActiveView('home');
              setActivePlaylist(null);
            }}
            className={`flex items-center gap-4 transition-colors px-2 py-1.5 rounded-md ${
              activeView === 'home' && !activePlaylist ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Home className="w-6 h-6" />
            <span>Trang chủ</span>
          </button>

          <button
            onClick={() => {
              setActiveView('search');
              setActivePlaylist(null);
            }}
            className={`flex items-center gap-4 transition-colors px-2 py-1.5 rounded-md ${
              activeView === 'search' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Search className="w-6 h-6" />
            <span>Tìm kiếm</span>
          </button>
        </nav>
      </div>

      {/* 2. Library & Playlists Card */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between text-[#b3b3b3] hover:text-white transition-colors">
          <div className="flex items-center gap-3">
            <Library className="w-6 h-6" />
            <span className="font-bold text-sm">Thư viện của bạn</span>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="hover:bg-[#282828] p-1.5 rounded-full transition-colors text-[#b3b3b3] hover:text-white"
            title="Tạo danh sách phát mới"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist Inline Creator */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="px-3 pb-3">
            <div className="flex gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="Tên danh sách phát..."
                value={newPlName}
                onChange={(e) => setNewPlName(e.target.value)}
                className="flex-1 bg-[#242424] text-xs px-2.5 py-1.5 rounded text-white border border-[#3e3e3e] focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#1db954] text-black text-xs font-bold px-2.5 py-1.5 rounded hover:bg-[#1ed760]"
              >
                Tạo
              </button>
            </div>
          </form>
        )}

        {/* Library Specials: Liked Songs & Downloaded */}
        <div className="px-2 pb-2 space-y-1">
          {/* Liked Songs */}
          <div
            onClick={() => {
              setActivePlaylist('liked');
              setActiveView('playlist');
            }}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              activePlaylist === 'liked' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="w-11 h-11 rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0 shadow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">Bài hát đã thích</span>
              <span className="text-xs text-[#b3b3b3] truncate">{likedSongsCount} bài hát • Yêu thích</span>
            </div>
          </div>

          {/* Downloaded Offline Songs */}
          <div
            onClick={() => {
              setActivePlaylist('downloaded');
              setActiveView('playlist');
            }}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              activePlaylist === 'downloaded' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="w-11 h-11 rounded bg-gradient-to-br from-[#006450] to-[#1ed760] flex items-center justify-center shrink-0 shadow">
              <ArrowDownCircle className="w-5 h-5 text-white fill-current" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                Đã tải xuống
                <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse"></span>
              </span>
              <span className="text-xs text-[#b3b3b3] truncate">
                {downloadedCount} bài hát • Nghe Offline
              </span>
            </div>
          </div>
        </div>

        {/* Curated & User Playlists List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 border-t border-[#282828]/50 pt-2">
          {/* User's Custom Playlists */}
          {userPlaylists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                setActivePlaylist(pl.id);
                setActiveView('playlist');
              }}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                activePlaylist === pl.id ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
              }`}
            >
              <img src={pl.cover} alt={pl.name} className="w-10 h-10 rounded object-cover shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">{pl.name}</span>
                <span className="text-xs text-[#b3b3b3] truncate">Danh sách phát cá nhân</span>
              </div>
            </div>
          ))}

          {/* Curated Public Playlists */}
          {publicPlaylists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                setActivePlaylist(pl.id);
                setActiveView('playlist');
              }}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                activePlaylist === pl.id ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
              }`}
            >
              <img src={pl.cover} alt={pl.name} className="w-10 h-10 rounded object-cover shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">{pl.name}</span>
                <span className="text-xs text-[#b3b3b3] truncate">{pl.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
