import React, { useState } from 'react';
import {
  MoreVertical,
  Feather,
  Shield,
  LogOut,
  Download,
  BookOpen,
  PlusCircle,
  ShoppingBag,
  Home,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { AdminUser, AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAdminLogin: () => void;
  admin: AdminUser | null;
  onLogoutAdmin: () => void;
  onOpenAdminDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAdminLogin,
  admin,
  onLogoutAdmin,
  onOpenAdminDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#443426]/12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-[#241F1A] hover:text-[#8B5A2B] transition-colors whitespace-nowrap shrink-0 group text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#F2EAE0] flex items-center justify-center text-[#8B5A2B] group-hover:bg-[#8B5A2B] group-hover:text-white transition-colors">
            <Feather className="w-4 h-4" />
          </div>
          <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight font-tamil-serif">
            வசந்த கவிதைகள்
          </span>
        </button>

        {/* Zone 2: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium text-[#5E5145] font-tamil-sans">
          <button
            type="button"
            onClick={() => handleNav('home')}
            className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'home'
                ? 'text-[#8B5A2B] font-bold bg-[#F4EBE0]'
                : 'hover:text-[#241F1A]'
            }`}
          >
            முகப்பு
          </button>

          <button
            type="button"
            onClick={() => handleNav('poems')}
            className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'poems'
                ? 'text-[#8B5A2B] font-bold bg-[#F4EBE0]'
                : 'hover:text-[#241F1A]'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>கவிதைகள்</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('books')}
            className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'books'
                ? 'text-[#8B5A2B] font-bold bg-[#F4EBE0]'
                : 'hover:text-[#241F1A]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>நூல்கள்</span>
          </button>

          {/* Dedicated Download Portal Button */}
          <button
            type="button"
            onClick={() => handleNav('download')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border ${
              currentView === 'download'
                ? 'border-[#8B5A2B] text-[#8B5A2B] font-bold bg-[#F4EBE0]'
                : 'border-[#DDD3C2] hover:border-[#8B5A2B]/40 hover:text-[#241F1A] bg-white'
            }`}
            title="கவிதைகளை ஆத்தர் பெயர் உள்ளிட்டு டவுன்லோட் செய்ய"
          >
            <Download className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>பதிவிறக்க மையம்</span>
          </button>

          {/* Dedicated Poem Submission Page Button */}
          <button
            type="button"
            onClick={() => handleNav('submit_poem')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'submit_poem'
                ? 'text-[#8B5A2B] font-bold bg-[#F4EBE0]'
                : 'hover:text-[#241F1A]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>உங்கள் கவிதை சேர்க்க</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + Promote Book + Secret Admin */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Highlighted Promote Book Action Button */}
          <button
            type="button"
            onClick={() => handleNav('promote_book')}
            className={`px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
              currentView === 'promote_book'
                ? 'bg-[#8B5A2B] text-white ring-2 ring-[#8B5A2B]/30'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
            }`}
            title="உங்கள் புத்தகத்தை அமேசான் இணைப்புடன் விளம்பரப்படுத்த"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-800" />
            <span className="font-tamil-sans">புத்தகத்தை விளம்பரப்படுத்த</span>
          </button>

          {/* Admin User Status or Login */}
          {admin ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenAdminDashboard}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#73431D] bg-[#F4E9DC] hover:bg-[#EBDDCB] rounded-lg transition-colors cursor-pointer border border-[#8B5A2B]/20"
                title="நிர்வாக பலகை (Admin Panel)"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">நிர்வாகம் ({admin.username})</span>
              </button>
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="p-1.5 rounded-lg text-[#7A6B5C] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                title="வெளியேறு (Logout)"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Discreet Secret 3-Dot Admin Menu Icon */}
          <button
            type="button"
            onClick={admin ? onOpenAdminDashboard : onOpenAdminLogin}
            className="p-2 rounded-lg text-[#8C7D6E] hover:text-[#241F1A] hover:bg-[#F2EAE0] transition-colors cursor-pointer"
            title="நிர்வாகி அணுகல் (Secret Admin Portal)"
            aria-label="Admin settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#5E5145] hover:bg-[#F2EAE0] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#443426]/10 bg-[#FCFAF6] px-4 py-4 space-y-2 shadow-lg">
          <button
            type="button"
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
              currentView === 'home'
                ? 'bg-[#F2EAE0] text-[#8B5A2B] font-bold'
                : 'text-[#4A3D30] hover:bg-[#F7F2EC]'
            }`}
          >
            <Home className="w-4 h-4 text-[#8B5A2B]" />
            <span>முகப்பு (Home)</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('poems')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
              currentView === 'poems'
                ? 'bg-[#F2EAE0] text-[#8B5A2B] font-bold'
                : 'text-[#4A3D30] hover:bg-[#F7F2EC]'
            }`}
          >
            <Feather className="w-4 h-4 text-[#8B5A2B]" />
            <span>கவிதைகள் பக்கம் (Poems View)</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('books')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
              currentView === 'books'
                ? 'bg-[#F2EAE0] text-[#8B5A2B] font-bold'
                : 'text-[#4A3D30] hover:bg-[#F7F2EC]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8B5A2B]" />
            <span>வெளியிடப்பட்ட நூல்கள் (Published Books)</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('download')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
              currentView === 'download'
                ? 'bg-[#F2EAE0] text-[#8B5A2B] font-bold'
                : 'text-[#4A3D30] hover:bg-[#F7F2EC]'
            }`}
          >
            <Download className="w-4 h-4 text-[#8B5A2B]" />
            <span>கவிதைகள் பதிவிறக்க மையம் (Download Portal)</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('submit_poem')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
              currentView === 'submit_poem'
                ? 'bg-[#F2EAE0] text-[#8B5A2B] font-bold'
                : 'text-[#4A3D30] hover:bg-[#F7F2EC]'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#8B5A2B]" />
            <span>உங்கள் கவிதையை சேர்க்க (Submit Poem)</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('promote_book')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
              currentView === 'promote_book'
                ? 'bg-[#8B5A2B] text-white font-bold'
                : 'bg-amber-100 text-amber-900 font-semibold'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>உங்கள் புத்தகத்தை விளம்பரப்படுத்தவும் (Amazon Promotion)</span>
          </button>
        </div>
      )}
    </header>
  );
};
