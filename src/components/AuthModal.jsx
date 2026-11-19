import React, { useState } from 'react';
import { Disc3, X, Eye, EyeOff, Loader2, CheckCircle, UserPlus, ArrowLeft } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login', // 'login' | 'register'
  onAuthSuccess,
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'google-chooser'
  const [username, setUsername] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Google Custom Input
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async (selectedEmail, selectedName) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedEmail,
          name: selectedName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập Google thất bại');

      setSuccessMsg(`Chào mừng ${data.user.username}! Đăng nhập Google thành công.`);
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
        setMode(initialMode);
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');

        setSuccessMsg('Đăng ký thành công! Đang đăng nhập...');
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
          onClose();
        }, 700);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrUsername, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');

        setSuccessMsg('Đăng nhập thành công!');
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
          onClose();
        }, 500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#121212] border border-[#282828] rounded-2xl p-8 sm:p-10 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* View A: Google Account Chooser */}
        {mode === 'google-chooser' ? (
          <div>
            <button
              onClick={() => {
                setMode(initialMode);
                setShowCustomGoogle(false);
              }}
              className="flex items-center gap-1.5 text-xs text-[#b3b3b3] hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h2 className="text-xl font-bold">Đăng nhập bằng Google</h2>
              <p className="text-xs text-[#b3b3b3] mt-1">Chọn tài khoản để tiếp tục tới KhoNhac</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-[#1db954]/10 border border-[#1db954]/30 text-[#1db954] rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {successMsg}
              </div>
            )}

            <div className="space-y-2 mb-4">
              {/* Account Preset 1: Khang Google */}
              <button
                disabled={loading}
                onClick={() => handleGoogleAuth('khang.google@gmail.com', 'Khang')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] border border-[#3e3e3e] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm">
                  K
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">Khang</span>
                  <span className="text-xs text-[#b3b3b3] truncate">khang.google@gmail.com</span>
                </div>
              </button>

              {/* Account Preset 2: He Account */}
              <button
                disabled={loading}
                onClick={() => handleGoogleAuth('he.vip@gmail.com', 'He')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] border border-[#3e3e3e] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">
                  H
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">He (Argon Bench)</span>
                  <span className="text-xs text-[#b3b3b3] truncate">he.vip@gmail.com</span>
                </div>
              </button>

              {/* Custom Google Account input */}
              {!showCustomGoogle ? (
                <button
                  onClick={() => setShowCustomGoogle(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-transparent hover:bg-[#1e1e1e] border border-dashed border-[#444] transition-colors text-xs font-semibold text-[#b3b3b3] hover:text-white"
                >
                  <UserPlus className="w-4 h-4 ml-2" />
                  <span>Sử dụng tài khoản Google khác...</span>
                </button>
              ) : (
                <div className="p-3 bg-[#1a1a1a] rounded-xl border border-[#3e3e3e] space-y-2">
                  <label className="text-[11px] font-semibold text-[#b3b3b3]">Nhập email Google của bạn:</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      autoFocus
                      placeholder="tenban@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="flex-1 bg-[#242424] text-xs px-3 py-2 rounded text-white border border-[#444] focus:outline-none focus:border-white"
                    />
                    <button
                      onClick={() => {
                        if (!customGoogleEmail.trim()) return;
                        const name = customGoogleEmail.split('@')[0];
                        handleGoogleAuth(customGoogleEmail.trim(), name);
                      }}
                      className="bg-[#1db954] text-black text-xs font-bold px-3 py-2 rounded hover:bg-[#1ed760]"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-2 text-xs text-[#1db954] gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang đồng bộ tài khoản Google vào cơ sở dữ liệu...
              </div>
            )}
          </div>
        ) : (
          /* View B: Standard Login / Register */
          <>
            {/* Brand Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#1db954] flex items-center justify-center mb-3 shadow-lg shadow-[#1db954]/20">
                <Disc3 className="w-8 h-8 text-black animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {mode === 'login' ? 'Đăng nhập vào KhoNhac' : 'Đăng ký tài khoản KhoNhac'}
              </h2>
              <p className="text-xs text-[#b3b3b3] mt-1.5">
                Nghe nhạc miễn phí không giới hạn, lưu thư viện và đồng bộ mọi thiết bị.
              </p>
            </div>

            {/* Social Quick Login */}
            <div className="space-y-2.5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('google-chooser');
                }}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-[#727272] hover:border-white font-bold text-sm text-white transition-all hover:scale-[1.01]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Tiếp tục với Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-[#282828] w-full"></div>
              <span className="bg-[#121212] px-3 text-[11px] font-bold text-[#727272] uppercase tracking-wider">
                Hoặc
              </span>
            </div>

            {/* Feedback Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-[#1db954]/10 border border-[#1db954]/30 text-[#1db954] rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {successMsg}
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Tên người dùng</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: SonTungFan"
                    className="w-full px-3.5 py-2.5 rounded bg-[#1e1e1e] border border-[#3e3e3e] focus:border-white focus:outline-none text-sm text-white placeholder-[#727272]"
                  />
                </div>
              )}

              {mode === 'register' ? (
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Địa chỉ Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded bg-[#1e1e1e] border border-[#3e3e3e] focus:border-white focus:outline-none text-sm text-white placeholder-[#727272]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Email hoặc tên người dùng</label>
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="Email hoặc tên người dùng"
                    className="w-full px-3.5 py-2.5 rounded bg-[#1e1e1e] border border-[#3e3e3e] focus:border-white focus:outline-none text-sm text-white placeholder-[#727272]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu của bạn"
                    className="w-full px-3.5 py-2.5 pr-10 rounded bg-[#1e1e1e] border border-[#3e3e3e] focus:border-white focus:outline-none text-sm text-white placeholder-[#727272]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#b3b3b3] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === 'login' ? (
                  'Đăng nhập'
                ) : (
                  'Đăng ký tài khoản'
                )}
              </button>
            </form>

            {/* Footer Mode Switcher */}
            <div className="mt-6 pt-5 border-t border-[#282828] text-center text-xs text-[#b3b3b3]">
              {mode === 'login' ? (
                <p>
                  Chưa có tài khoản KhoNhac?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-white font-bold underline hover:text-[#1db954]"
                  >
                    Đăng ký KhoNhac
                  </button>
                </p>
              ) : (
                <p>
                  Đã có tài khoản KhoNhac?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-white font-bold underline hover:text-[#1db954]"
                  >
                    Đăng nhập tại đây
                  </button>
                </p>
              )}

              <div className="mt-3">
                <button
                  onClick={onClose}
                  className="text-[#727272] hover:text-white transition-colors text-[11px]"
                >
                  Tiếp tục nghe thử với tư cách Khách
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
