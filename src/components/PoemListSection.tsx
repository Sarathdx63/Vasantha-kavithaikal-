import React from 'react';
import { Heart, BookOpen, Download, FileText, Feather, Eye } from 'lucide-react';
import { Poem } from '../types';

interface PoemListSectionProps {
  poems: Poem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenPoemModal: (poem: Poem) => void;
  onLikePoem: (poemId: number) => void;
  onOpenSubmitModal: () => void;
  searchQuery: string;
}

export const PoemListSection: React.FC<PoemListSectionProps> = ({
  poems,
  selectedCategory,
  onSelectCategory,
  onOpenPoemModal,
  onLikePoem,
  onOpenSubmitModal,
  searchQuery,
}) => {
  const categories = [
    'அனைத்தும்',
    'இயற்கை',
    'காதல்',
    'வாழ்க்கை',
    'தத்துவம்',
    'தமிழ் பெருமை',
  ];

  const handleQuickTxtDownload = (poem: Poem, e: React.MouseEvent) => {
    e.stopPropagation();
    fetch(`/api/poems/${poem.id}/download`, { method: 'POST' }).catch(() => {});

    const fileContent = `=====================================================
வசந்த கவிதைகள் • Vasantha Kavithaigal
=====================================================

தலைப்பு: ${poem.title}
ஆசிரியர்: ${poem.author}
வகை: ${poem.category}
பதிவிடப்பட்ட நாள்: ${new Date(poem.created_at).toLocaleDateString('ta-IN')}

-----------------------------------------------------
${poem.content}
=====================================================
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${poem.title.replace(/\s+/g, '_')}_vasantham.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="poems" className="py-20 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#8B5A2B] mb-2 font-serif">
              <span>கவிதைச் சோலை • Contemporary Verse</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#241F1A] font-tamil-serif tracking-tight">
              வாசகர் கவிதைக் களம்
            </h2>
            <p className="mt-2 text-sm text-[#6E6052] font-tamil-sans">
              உணர்வுகளின் வெளிப்பாடாய் தமிழ் வரிகளில் மலர்ந்த கவிதைகளை வாசித்து மகிழுங்கள்.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#241F1A] hover:bg-[#3E3227] text-[#FDFBF7] text-xs sm:text-sm font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Feather className="w-4 h-4 text-[#E0B888]" />
            <span>உங்கள் கவிதையைச் சேர்க்க</span>
          </button>
        </div>

        {/* Category Tabs (Segmented Button Controls) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F1EAE0] rounded-xl max-w-2xl mb-10 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-[#241F1A] shadow-xs font-semibold'
                  : 'text-[#6C5D4F] hover:text-[#241F1A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Poems Grid */}
        {poems.length === 0 ? (
          <div className="py-16 text-center bg-[#F8F4EC] rounded-2xl border border-[#E8DECF] p-8 max-w-lg mx-auto">
            <Feather className="w-10 h-10 text-[#A89886] mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-[#342A20] font-tamil-serif">
              கவிதைகள் எதுவும் காணப்படவில்லை
            </h3>
            <p className="text-xs text-[#786959] mt-2 mb-5">
              {searchQuery
                ? `"${searchQuery}" என்ற சொல்லிற்குரிய கவிதைகள் எதுவும் கிடைக்கவில்லை.`
                : 'இந்த பிரிவில் இன்னும் கவிதைகள் சேர்க்கப்படவில்லை.'}
            </p>
            <button
              type="button"
              onClick={onOpenSubmitModal}
              className="px-4 py-2 rounded-lg bg-[#241F1A] text-[#FDFBF7] text-xs font-medium hover:bg-[#3D3329] transition-colors"
            >
              முதல் கவிதையை நீங்களே எழுதுங்கள்!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {poems.map((poem) => (
              <article
                key={poem.id}
                onClick={() => onOpenPoemModal(poem)}
                className="group bg-[#FCFAF6] rounded-2xl border border-[#443426]/12 hover:border-[#8B5A2B]/40 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                {/* Top Subtle Parchment Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8DAC6] group-hover:bg-[#8B5A2B] transition-colors" />

                <div>
                  {/* Clean unboxed metadata with separators */}
                  <div className="flex items-center gap-2 text-xs text-[#8A7969] mb-3">
                    <span className="font-medium text-[#8B5A2B]">{poem.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(poem.created_at).toLocaleDateString('ta-IN')}</span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#1F1812] font-tamil-serif group-hover:text-[#8B5A2B] transition-colors leading-snug">
                    {poem.title}
                  </h3>

                  <p className="text-xs text-[#6B5C4F] mt-1 font-tamil-sans">
                    ஆசிரியர்: <span className="font-semibold text-[#30261E]">{poem.author}</span>
                  </p>

                  {/* Poem Verse Preview (3-4 lines with ellipsis) */}
                  <div className="mt-4 p-4 rounded-xl bg-[#F8F4EC] border border-[#E9DFCF] font-tamil-serif text-sm leading-relaxed text-[#332A22] whitespace-pre-line line-clamp-4">
                    {poem.content}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-[#EAE1D3] flex items-center justify-between text-xs text-[#7A6B5C]">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikePoem(poem.id);
                      }}
                      className="flex items-center gap-1 hover:text-[#C85A32] transition-colors"
                      title="விருப்பம் (Like)"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#C85A32]/20 text-[#C85A32]" />
                      <span>{poem.likes_count}</span>
                    </button>

                    <div className="flex items-center gap-1" title="பார்வைகள் (Reads)">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{poem.reads_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleQuickTxtDownload(poem, e)}
                      className="p-1.5 rounded-md hover:bg-[#F0E6D8] text-[#6B5B4C] hover:text-[#241F1A] transition-colors"
                      title="உரை வடிவம் (TXT) பதிவிறக்கு"
                      aria-label="Download TXT"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPoemModal(poem)}
                      className="flex items-center gap-1 font-semibold text-[#8B5A2B] group-hover:text-[#643E19] transition-colors pl-1"
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
    </section>
  );
};
