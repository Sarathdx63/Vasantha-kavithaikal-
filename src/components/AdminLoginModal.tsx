import React, { useState } from 'react';
import { X, Lock, Shield, Eye, EyeOff, KeyRound } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  onClose: () => void;
  onLoginSuccess: (token: string, admin: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('vasantham2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('vasantham_admin_token', data.token);
        onLoginSuccess(data.token, data.admin);
        onClose();
      } else {
        setError(data.error || 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.');
      }
    } catch {
      setError('சேவையக இணைப்புப் பிழை. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120E0A]/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#FCFAF6] border border-[#443426]/20 shadow-2xl p-6 sm:p-8 text-[#241F1A]">
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5A2B] via-[#D4AF37] to-[#8B5A2B]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#7A6B5C] hover:text-[#241F1A] hover:bg-[#EFE6D9] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#F3ECE0] flex items-center justify-center mb-3 text-[#8B5A2B] shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1F1914] font-tamil-serif">
            நிர்வாகி உள்நுழைவு
          </h2>
          <p className="text-xs text-[#7A6B5C] mt-1">
            Admin Authentication • வசந்த கவிதைகள்
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
              பயனர்பெயர் (Username)
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
              கடவுச்சொல் (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7969] hover:text-[#241F1A]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick preset credentials helper for easy testing */}
          <div className="p-3 bg-[#F4EDE2] rounded-xl text-[11px] text-[#6E5E4E] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#8B5A2B]" />
              <span>இயல்புநிலை: <code className="bg-white/70 px-1 py-0.5 rounded">admin</code> / <code className="bg-white/70 px-1 py-0.5 rounded">vasantham2026!</code></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('vasantham2026!');
              }}
              className="text-[#8B5A2B] hover:underline font-semibold cursor-pointer"
            >
              நிரப்பு
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#241F1A] hover:bg-[#3D332B] disabled:bg-[#A39686] text-[#FDFBF7] text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-[#E0B888]" />
            <span>{loading ? 'சரிபார்க்கப்படுகிறது...' : 'உள்நுழைக (Sign In)'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
