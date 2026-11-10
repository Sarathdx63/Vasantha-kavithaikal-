import React from 'react';
import { Search, BookOpen, Feather, X, BookMarked, SlidersHorizontal } from 'lucide-react';
import { SearchContentType } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedAuthor: string;
  onSelectAuthor: (author: string) => void;
  contentType: SearchContentType;
  onSelectContentType: (type: SearchContentType) => void;
  availableAuthors: string[];
  onOpenPoemSubmit: () => void;
  totalMatchesCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedAuthor,
  onSelectAuthor,
  contentType,
  onSelectContentType,
  availableAuthors,
  onOpenPoemSubmit,
  totalMatchesCount,
}) => {
  const categories = [
    'அனைத்தும்',
    'இயற்கை',
    'காதல்',
    'வாழ்க்கை',
    'தத்துவம்',
    'தமிழ் பெருமை',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCategory !== 'அனைத்தும்' || selectedAuthor !== 'அனைத்தும்') {
      const resultsEl = document.getElementById('search-results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="top" className="relative min-h-[600px] lg:min-h-[660px] flex items-center justify-center overflow-hidden">
      {/* High-Resolution Literary Desk Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_poetic_desk_1794242032461.jpg"
          alt="Antique Tamil Literary Writing Desk"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        {/* Measured Scrim for WCAG AA Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#18120B]/90 via-[#1C160F]/80 to-[#18120B]/60" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#18120B]/30 to-[#18120B]/80" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        {/* Poetic Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5C9A3]/15 border border-[#E5C9A3]/30 text-[#E5C9A3] text-xs sm:text-sm font-serif mb-6 backdrop-blur-xs">
          <Feather className="w-3.5 h-3.5 text-[#E5C9A3]" />
          <span>இலக்கியப் பூங்கா • Vasantha Kavithaigal</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#FDFBF7] tracking-tight font-tamil-serif leading-tight sm:leading-snug max-w-4xl mx-auto drop-shadow-sm">
          சொல்லில் பிறக்கும் வசந்தம்...
          <br className="hidden sm:inline" />
          <span className="text-[#E0B888] italic font-serif-display"> நெஞ்சில் மலரும் கவிதை</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-[#E3DACD] max-w-2xl mx-auto leading-relaxed font-tamil-sans font-light">
          தூய தமிழ் மரபுக்கவிதைகள், சிந்தனையைத் தூண்டும் புதுக்கவிதைகள் மற்றும் அமேசானில் வாங்குவதற்குரிய வெளியிடப்பட்ட கவிதை நூல்களின் பிரத்யேகத் தளம்.
        </p>

        {/* Integrated Robust Search Box */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-[#FDFBF7]/95 rounded-2xl shadow-2xl p-2 border border-[#E5C9A3]/40">
            <Search className="w-5 h-5 text-[#8C7D6E] ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="கவிதை, நூல் தலைப்பு, ஆசிரியர் அல்லது வரிகள் தேடுக..."
              className="w-full px-3 py-2.5 text-sm sm:text-base text-[#241F1A] placeholder-[#9E9080] bg-transparent focus:outline-none font-tamil-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1.5 rounded-full text-[#8C7D6E] hover:text-[#241F1A] hover:bg-[#EAE2D4] mr-1"
                title="நீக்கு (Clear)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#241F1A] hover:bg-[#3D3227] text-[#FDFBF7] text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              தேடுக
            </button>
          </form>

          {/* Type Switcher & Author Filter Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
            {/* Content Type Filter */}
            <div className="flex items-center gap-1 bg-[#241B12]/80 p-1 rounded-xl border border-[#E5C9A3]/25 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => onSelectContentType('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  contentType === 'all'
                    ? 'bg-[#E0B888] text-[#1F1914] font-semibold shadow-xs'
                    : 'text-[#E0D5C7] hover:text-white'
                }`}
              >
                அனைத்தும்
              </button>
              <button
                type="button"
                onClick={() => onSelectContentType('poems')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  contentType === 'poems'
                    ? 'bg-[#E0B888] text-[#1F1914] font-semibold shadow-xs'
                    : 'text-[#E0D5C7] hover:text-white'
                }`}
              >
                <Feather className="w-3 h-3" />
                <span>கவிதைகள்</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectContentType('books')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  contentType === 'books'
                    ? 'bg-[#E0B888] text-[#1F1914] font-semibold shadow-xs'
                    : 'text-[#E0D5C7] hover:text-white'
                }`}
              >
                <BookMarked className="w-3 h-3" />
                <span>நூல்கள்</span>
              </button>
            </div>

            {/* Author Dropdown */}
            {availableAuthors.length > 0 && (
              <div className="flex items-center gap-1 bg-[#241B12]/80 px-2.5 py-1 rounded-xl border border-[#E5C9A3]/25 text-[#E0D5C7] backdrop-blur-xs">
                <span className="text-[11px] text-[#CBBBA8]">ஆசிரியர்:</span>
                <select
                  value={selectedAuthor}
                  onChange={(e) => onSelectAuthor(e.target.value)}
                  className="bg-transparent text-xs text-[#E0B888] font-medium outline-none cursor-pointer py-0.5"
                >
                  <option value="அனைத்தும்" className="bg-[#241F1A] text-white">
                    அனைத்து ஆசிரியர்களும்
                  </option>
                  {availableAuthors.map((auth) => (
                    <option key={auth} value={auth} className="bg-[#241F1A] text-white">
                      {auth}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Quick Category Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer font-tamil-sans ${
                selectedCategory === cat
                  ? 'bg-[#E0B888] text-[#1F1914] font-semibold shadow-sm'
                  : 'bg-[#2A2016]/70 text-[#E0D5C7] hover:bg-[#3E3022]/80 border border-[#E5C9A3]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#poems"
            className="px-6 py-3 rounded-xl bg-[#E0B888] hover:bg-[#CFA26E] text-[#1F1914] text-sm font-semibold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>கவிதைகளை வாசிக்க</span>
          </a>
          <button
            type="button"
            onClick={onOpenPoemSubmit}
            className="px-6 py-3 rounded-xl bg-[#2A2016]/80 hover:bg-[#3D3023] border border-[#E0B888]/40 text-[#FDFBF7] text-sm font-medium transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
          >
            <Feather className="w-4 h-4 text-[#E0B888]" />
            <span>உங்கள் கவிதை சமர்ப்பிக்க</span>
          </button>
        </div>
      </div>
    </section>
  );
};
