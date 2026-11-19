import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X, Sparkles, LogOut, User, CheckCircle2 } from 'lucide-react';

export default function TopBar({
  activeView,
  searchQuery,
  setSearchQuery,
  onNavigateHome,
  user,
  onOpenAuth,
  onLogout,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-[#101010]/95 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between gap-4 border-b border-[#282828]/50">
      {/* Navigation Arrows & Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateHome}
            className="w-8 h-8 rounded-full bg-black/70 hover:bg-black flex items-center justify-center text-white/80 hover:text-white transition-colors"
            title="Quay lại"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 rounded-full bg-black/40 text-white/40 flex items-center justify-center cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {activeView === 'search' && (
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bạn muốn nghe gì? (Bài hát, nghệ sĩ, album...)"
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white text-sm rounded-full pl-11 pr-10 py-3 outline-none ring-2 ring-transparent focus:ring-white transition-all placeholder:text-[#727272]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right User & Auth Controls */}
      <div className="flex items-center gap-3">
        {/* KhoNhac VIP Badge */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#1db954]/15 border border-[#1db954]/40 text-[#1db954] text-xs font-bold px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>KHONHAC PRO (FREE)</span>
        </div>

        {user ? (
          /* Logged In User Pill with Dropdown */
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-black/80 hover:bg-[#282828] p-1 pr-3 rounded-full transition-colors border border-white/10"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                alt={user.username}
                className="w-7 h-7 rounded-full bg-emerald-700 object-cover"
              />
              <span className="text-xs font-bold text-white max-w-[120px] truncate">{user.username}</span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-[#282828] border border-[#3e3e3e] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-white"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-[#3e3e3e]/60">
                  <div className="font-bold text-sm truncate">{user.username}</div>
                  <div className="text-[#b3b3b3] text-[11px] truncate">{user.email}</div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1.5 text-[#1db954] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Thành viên chính thức
                  </div>
                </div>

                <div className="border-t border-[#3e3e3e]/60 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#383838] flex items-center gap-2 text-red-400 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Guest Actions: Đăng ký & Đăng nhập */
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="text-[#b3b3b3] hover:text-white font-bold text-sm px-4 py-2 transition-colors hover:scale-105"
            >
              Đăng ký
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="bg-white hover:bg-white/90 text-black font-extrabold text-sm px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-md"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
