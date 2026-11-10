import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Heart,
  FileText,
  Eye,
  ArrowLeft,
  Feather,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { Poem } from '../types';
import { filterAndRankPoems } from '../utils/search';

interface PoemsPageProps {
  poems: Poem[];
  onBackToHome: () => void;
  onOpenPoemModal: (poem: Poem) => void;
  onLikePoem: (poemId: number) => void;
  onGoToSubmit: () => void;
  onGoToDownload: (authorName?: string) => void;
  availableAuthors: string[];
}

export const PoemsPage: React.FC<PoemsPageProps> = ({
  poems,
  onBackToHome,
  onOpenPoemModal,
  onLikePoem,
  onGoToSubmit,
  onGoToDownload,
  availableAuthors,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('அனைத்தும்');
  const [selectedAuthor, setSelectedAuthor] = useState('அனைத்தும்');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'popular' | 'title'>('newest');

  const categories = [
    'அனைத்தும்',
    'இயற்கை',
    'காதல்',
    'வாழ்க்கை',
    'தத்துவம்',
    'தமிழ் பெருமை',
    'சமூகம்',
  ];

  const filteredPoems = useMemo(() => {
    return filterAndRankPoems(poems, {
      query: searchQuery,
      category: selectedCategory,
      author: selectedAuthor,
      sortBy,
    });
  }, [poems, searchQuery, selectedCategory, selectedAuthor, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('அனைத்தும்');
    setSelectedAuthor('அனைத்தும்');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7A6B5C] hover:text-[#241F1A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>முகப்புக்குத் திரும்பு (Home)</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onGoToDownload()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5C7B5] bg-white hover:bg-[#F2ECE1] text-[#342A20] text-xs font-medium transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#8B5A2B]" />
              <span>பதிவிறக்க மையம் (Downloads)</span>
            </button>
            <button
              type="button"
              onClick={onGoToSubmit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#241F1A] hover:bg-[#3E3227] text-[#FDFBF7] text-xs font-semibold transition-colors shadow-sm"
            >
              <Feather className="w-3.5 h-3.5 text-[#E0B888]" />
              <span>உங்கள் கவிதை எழுத</span>
            </button>
          </div>
        </div>

        {/* Page Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5C9A3]/25 text-[#73431D] text-xs font-serif font-semibold mb-3">
            <Feather className="w-3.5 h-3.5" />
            <span>முழு கவிதைத் தொகுப்பு • Tamil Poetry Archive</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1F1914] font-tamil-serif tracking-tight">
            கவிதைச் சோலை
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#6E6052] font-tamil-sans leading-relaxed">
            பாரம்பரிய மரபுக்கவிதைகள் முதல் நவீன புதுக்கவிதைகள் வரை, தமிழ் மொழியின் உயிரோட்டமான உணர்ச்சி வரிகளை வாசித்து மகிழுங்கள்.
          </p>
        </div>

        {/* Search & Filter Control Panel */}
        <div className="bg-[#F8F4EC] rounded-2xl border border-[#DDD3C2] p-5 sm:p-6 mb-10 shadow-xs">
          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7D6E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="கவிதை தலைப்பு, ஆசிரியர் பெயர் அல்லது வரிகளைத் தேடுக..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D5C7B5] bg-white text-sm text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 outline-none font-tamil-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7D6E] hover:text-[#241F1A]"
              >
                நீக்கு
              </button>
            )}
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category / Genre */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5B4E41] uppercase mb-1">
                கவிதை வகை (Genre)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] font-medium outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5B4E41] uppercase mb-1">
                படைப்பாளர் (Author)
              </label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] font-medium outline-none cursor-pointer"
              >
                {availableAuthors.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5B4E41] uppercase mb-1">
                வரிசைப்படுத்து (Sort)
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] font-medium outline-none cursor-pointer"
              >
                <option value="newest">புதியவை முதலில் (Newest)</option>
                <option value="popular">அதிகம் வாசிக்கப்பட்டவை (Popular)</option>
                <option value="relevance">பொருத்தம் (Relevance)</option>
                <option value="title">தலைப்பு அகரவரிசை (Title A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Summary & Reset */}
          {(searchQuery || selectedCategory !== 'அனைத்தும்' || selectedAuthor !== 'அனைத்தும்') && (
            <div className="mt-4 pt-3 border-t border-[#EAE2D4] flex items-center justify-between text-xs text-[#7A6B5C]">
              <span>
                காட்டப்படும் கவிதைகள்: <strong>{filteredPoems.length}</strong>
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[#7A3E1D] hover:underline font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>வடிகட்டிகளை மீட்டமை (Reset)</span>
              </button>
            </div>
          )}
        </div>

        {/* Poems Grid */}
        {filteredPoems.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-[#D5C7B5] p-8 max-w-lg mx-auto">
            <Feather className="w-12 h-12 text-[#A89886] mx-auto mb-3" />
            <h3 className="text-xl font-serif font-bold text-[#342A20] font-tamil-serif">
              கவிதைகள் எதுவும் பொருந்தவில்லை
            </h3>
            <p className="text-xs sm:text-sm text-[#786959] mt-2 mb-6 font-tamil-sans">
              தேர்வு செய்யப்பட்ட வடிகட்டிகளுக்குரிய கவிதைகள் எதுவும் கிடைக்கவில்லை. வேறு சொல்லைப் பயன்படுத்தி தேடுங்கள் அல்லது உங்கள் கவிதையை நேரடியாகச் சமர்ப்பியுங்கள்.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-[#241F1A] text-white text-xs font-medium hover:bg-[#3E3227]"
              >
                வடிகட்டிகளை மீட்டமைக்க
              </button>
              <button
                type="button"
                onClick={onGoToSubmit}
                className="px-4 py-2 rounded-xl border border-[#D5C7B5] text-[#342A20] text-xs font-medium hover:bg-[#F2ECE1]"
              >
                கவிதை சமர்ப்பிக்க
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPoems.map((poem) => (
              <article
                key={poem.id}
                onClick={() => onOpenPoemModal(poem)}
                className="group bg-white rounded-2xl border border-[#443426]/12 hover:border-[#8B5A2B]/40 p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                {/* Top Subtle Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8DAC6] group-hover:bg-[#8B5A2B] transition-colors" />

                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A7969] mb-3">
                    <span className="font-semibold text-[#8B5A2B]">{poem.category}</span>
                    <span>{new Date(poem.created_at).toLocaleDateString('ta-IN')}</span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#1F1812] font-tamil-serif group-hover:text-[#8B5A2B] transition-colors leading-snug">
                    {poem.title}
                  </h3>

                  <p className="text-xs text-[#6B5C4F] mt-1 font-tamil-sans">
                    ஆசிரியர்: <span className="font-semibold text-[#30261E]">{poem.author}</span>
                  </p>

                  <div className="mt-4 p-4 rounded-xl bg-[#FBF9F5] border border-[#EBE3D3] font-tamil-serif text-sm leading-relaxed text-[#332A22] whitespace-pre-line line-clamp-4">
                    {poem.content}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EAE1D3] flex items-center justify-between text-xs text-[#7A6B5C]">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikePoem(poem.id);
                      }}
                      className="flex items-center gap-1 hover:text-[#C85A32] transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#C85A32]/20 text-[#C85A32]" />
                      <span>{poem.likes_count}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{poem.reads_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGoToDownload(poem.author);
                      }}
                      className="p-1.5 rounded-lg text-[#7A6B5C] hover:text-[#241F1A] hover:bg-[#F2ECE1] transition-colors"
                      title="பதிவிறக்க மையத்தில் பதிவிறக்கு (Download)"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPoemModal(poem)}
                      className="flex items-center gap-1 font-semibold text-[#8B5A2B] group-hover:text-[#643E19]"
                    >
                      <span>வாசிக்க</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
