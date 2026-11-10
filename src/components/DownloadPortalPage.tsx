import React, { useState, useMemo } from 'react';
import {
  Download,
  FileText,
  Image as ImageIcon,
  Search,
  ArrowLeft,
  User,
  Heart,
  Eye,
  CheckCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Poem } from '../types';

interface DownloadPortalPageProps {
  poems: Poem[];
  onBackToHome: () => void;
  onOpenPoemModal: (poem: Poem) => void;
  initialAuthor?: string;
  availableAuthors: string[];
}

export const DownloadPortalPage: React.FC<DownloadPortalPageProps> = ({
  poems,
  onBackToHome,
  onOpenPoemModal,
  initialAuthor = '',
  availableAuthors,
}) => {
  const [authorQuery, setAuthorQuery] = useState(initialAuthor);
  const [keywordQuery, setKeywordQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('அனைத்தும்');
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'png'>('png');
  const [cardTheme, setCardTheme] = useState<'parchment' | 'midnight' | 'rain' | 'terracotta'>('parchment');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [lastDownloadedTitle, setLastDownloadedTitle] = useState<string | null>(null);

  const categories = [
    'அனைத்தும்',
    'இயற்கை',
    'காதல்',
    'வாழ்க்கை',
    'தத்துவம்',
    'தமிழ் பெருமை',
  ];

  // Filter poems according to author name and keyword
  const filteredPoems = useMemo(() => {
    return poems.filter((poem) => {
      // 1. Author Filter
      if (authorQuery.trim()) {
        const aq = authorQuery.trim().toLowerCase();
        if (!poem.author.toLowerCase().includes(aq)) {
          return false;
        }
      }

      // 2. Keyword Filter
      if (keywordQuery.trim()) {
        const kq = keywordQuery.trim().toLowerCase();
        const matchTitle = poem.title.toLowerCase().includes(kq);
        const matchContent = poem.content.toLowerCase().includes(kq);
        if (!matchTitle && !matchContent) {
          return false;
        }
      }

      // 3. Category Filter
      if (selectedCategory !== 'அனைத்தும்' && poem.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [poems, authorQuery, keywordQuery, selectedCategory]);

  // Safe TXT Download
  const handleDownloadTxt = (poem: Poem) => {
    fetch(`/api/poems/${poem.id}/download`, { method: 'POST' }).catch(() => {});

    const fileContent = `=====================================================
வசந்த கவிதைகள் • Vasantha Kavithaigal
=====================================================

தலைப்பு: ${poem.title}
ஆசிரியர்: ${poem.author}
வகை: ${poem.category}
பதிவிடப்பட்ட நாள்: ${new Date(poem.created_at).toLocaleDateString('ta-IN')}

-----------------------------------------------------
கவிதை வரிகள்:
-----------------------------------------------------

${poem.content}

=====================================================
இலக்கியப் பூங்கா • வசந்த கவிதைகள்
=====================================================
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${poem.title.replace(/\s+/g, '_')}_${poem.author.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setLastDownloadedTitle(poem.title);
    setTimeout(() => setLastDownloadedTitle(null), 3000);
  };

  // Safe HTML5 Canvas PNG Card Download with Themes
  const handleDownloadPng = async (poem: Poem) => {
    setDownloadingId(poem.id);
    fetch(`/api/poems/${poem.id}/download`, { method: 'POST' }).catch(() => {});

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const width = 1080;
      const height = 1440;
      canvas.width = width;
      canvas.height = height;

      // Theme Palettes
      const themes = {
        parchment: {
          bg1: '#FCFAF6',
          bg2: '#F5EDE1',
          bg3: '#EDE2D1',
          border1: '#8B5A2B',
          border2: '#D4AF37',
          accent: '#8B5A2B',
          title: '#1F1812',
          author: '#8B5A2B',
          body: '#261F18',
          footer: '#6E5C4E',
        },
        midnight: {
          bg1: '#111827',
          bg2: '#0F172A',
          bg3: '#0A0E17',
          border1: '#D4AF37',
          border2: '#93C5FD',
          accent: '#FDE047',
          title: '#F8FAFC',
          author: '#93C5FD',
          body: '#E2E8F0',
          footer: '#94A3B8',
        },
        rain: {
          bg1: '#F1F5F3',
          bg2: '#E2ECE7',
          bg3: '#D1E0DA',
          border1: '#2D5A46',
          border2: '#689F88',
          accent: '#2D5A46',
          title: '#132A20',
          author: '#2D5A46',
          body: '#1C362B',
          footer: '#4A6B5D',
        },
        terracotta: {
          bg1: '#FAF4EF',
          bg2: '#F3E5D9',
          bg3: '#E8D2C0',
          border1: '#9A3412',
          border2: '#D97706',
          accent: '#9A3412',
          title: '#431407',
          author: '#9A3412',
          body: '#431407',
          footer: '#78350F',
        },
      };

      const t = themes[cardTheme];

      // 1. Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, t.bg1);
      bgGrad.addColorStop(0.5, t.bg2);
      bgGrad.addColorStop(1, t.bg3);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Borders
      ctx.strokeStyle = t.border1;
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      ctx.strokeStyle = t.border2;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(62, 62, width - 124, height - 124);

      // Corner Accents
      const cornerSize = 25;
      ctx.fillStyle = t.border1;
      ctx.fillRect(46, 46, cornerSize, cornerSize);
      ctx.fillRect(width - 50 - cornerSize + 4, 46, cornerSize, cornerSize);
      ctx.fillRect(46, height - 50 - cornerSize + 4, cornerSize, cornerSize);
      ctx.fillRect(width - 50 - cornerSize + 4, height - 50 - cornerSize + 4, cornerSize, cornerSize);

      // 3. Header Stamp
      ctx.textAlign = 'center';
      ctx.fillStyle = t.accent;
      ctx.font = 'bold 26px "Noto Serif Tamil", Georgia, serif';
      ctx.fillText('• வசந்த கவிதைகள் •', width / 2, 130);

      ctx.fillStyle = t.footer;
      ctx.font = '18px "Noto Sans Tamil", sans-serif';
      ctx.fillText(`வகை: ${poem.category}`, width / 2, 168);

      // Divider
      ctx.strokeStyle = t.border2;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 180, 200);
      ctx.lineTo(width / 2 + 180, 200);
      ctx.stroke();

      // 4. Title & Author
      ctx.fillStyle = t.title;
      ctx.font = 'bold 44px "Noto Serif Tamil", Georgia, serif';
      ctx.fillText(poem.title, width / 2, 280);

      ctx.fillStyle = t.author;
      ctx.font = 'italic 26px "Noto Serif Tamil", Georgia, serif';
      ctx.fillText(`— கவிஞர்: ${poem.author}`, width / 2, 330);

      ctx.fillStyle = t.accent;
      ctx.font = '28px sans-serif';
      ctx.fillText('❦', width / 2, 380);

      // 5. Lines
      ctx.fillStyle = t.body;
      ctx.font = '28px "Noto Serif Tamil", Georgia, serif';

      const lines = poem.content.split('\n');
      const lineHeight = 44;
      let startY = 460;
      const maxLines = 16;
      const displayLines = lines.slice(0, maxLines);

      displayLines.forEach((line) => {
        ctx.fillText(line.trim(), width / 2, startY);
        startY += lineHeight;
      });

      if (lines.length > maxLines) {
        ctx.fillStyle = t.footer;
        ctx.font = 'italic 20px "Noto Serif Tamil", serif';
        ctx.fillText('... (முழு கவிதை வசந்த கவிதைகள் தளத்தில்) ...', width / 2, startY + 20);
      }

      // 6. Footer
      ctx.fillStyle = t.footer;
      ctx.font = '18px "Noto Sans Tamil", sans-serif';
      ctx.fillText('இலக்கியச் சோலை • vasantham-kavithaigal', width / 2, height - 100);

      // Export
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `${poem.title.replace(/\s+/g, '_')}_${cardTheme}_card.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setLastDownloadedTitle(poem.title);
      setTimeout(() => setLastDownloadedTitle(null), 3000);
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const cleanAuthors = availableAuthors.filter((a) => a !== 'அனைத்தும்');

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7A6B5C] hover:text-[#241F1A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>முகப்புக்குத் திரும்பு (Home)</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C9A3]/25 text-[#73431D] text-xs font-semibold mb-3">
            <Download className="w-3.5 h-3.5" />
            <span>பதிவிறக்க மையம் • Tamil Poems Download Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1F1914] font-tamil-serif tracking-tight">
            கவிதைகள் பதிவிறக்கம்
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#6E6052] font-tamil-sans leading-relaxed">
            எந்த ஒரு கவிதையையும் ஆசிரியர் பெயரைத் தேடி, தெளிவான உரை வடிவமாகவோ (TXT) அல்லது அழகிய கவிதை அட்டையாகவோ (PNG Card) ஒரே கிளிக்கில் பதிவிறக்கம் செய்துகொள்ளலாம்.
          </p>
        </div>

        {/* Success Alert */}
        {lastDownloadedTitle && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center justify-between shadow-xs max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>"{lastDownloadedTitle}"</strong> கவிதை வெற்றிகரமாகப் பதிவிறக்கப்பட்டது!
              </span>
            </div>
            <button
              onClick={() => setLastDownloadedTitle(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Author Search & Customization Control Bar */}
        <div className="bg-[#F8F4EC] rounded-3xl border border-[#DDD3C2] p-6 sm:p-8 mb-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* 1. Author Name Search */}
            <div>
              <label className="block text-xs font-bold text-[#342A20] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>ஆசிரியர் பெயரைத் தேடுக (Search by Author Name):</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7D6E]" />
                <input
                  type="text"
                  value={authorQuery}
                  onChange={(e) => setAuthorQuery(e.target.value)}
                  placeholder="உதாரணம்: பாரதியார், வசந்தகுமார், அருண்மொழி..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D5C7B5] bg-white text-sm text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 outline-none"
                />
                {authorQuery && (
                  <button
                    type="button"
                    onClick={() => setAuthorQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7D6E] hover:text-[#241F1A]"
                  >
                    நீக்கு
                  </button>
                )}
              </div>
            </div>

            {/* 2. Keyword / Title Search */}
            <div>
              <label className="block text-xs font-bold text-[#342A20] mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>கவிதை தலைப்பு / சொல் (Search by Title or Keyword):</span>
              </label>
              <input
                type="text"
                value={keywordQuery}
                onChange={(e) => setKeywordQuery(e.target.value)}
                placeholder="உதாரணம்: வசந்தம், மழை, நிலா..."
                className="w-full px-4 py-3 rounded-xl border border-[#D5C7B5] bg-white text-sm text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 outline-none"
              />
            </div>
          </div>

          {/* Quick Author Selection Chips */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold text-[#6C5D4F] block mb-2">
              விரைவு ஆசிரியர் தேர்வு (Quick Select Author):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthorQuery('')}
                className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  !authorQuery ? 'bg-[#241F1A] text-white font-semibold' : 'bg-white border border-[#D5C7B5] text-[#4A3D31] hover:bg-[#EAE1D3]'
                }`}
              >
                அனைத்து ஆசிரியர்களும்
              </button>
              {cleanAuthors.map((auth) => (
                <button
                  key={auth}
                  type="button"
                  onClick={() => setAuthorQuery(auth)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    authorQuery === auth
                      ? 'bg-[#8B5A2B] text-white font-semibold shadow-2xs'
                      : 'bg-white border border-[#D5C7B5] text-[#4A3D31] hover:bg-[#EAE1D3]'
                  }`}
                >
                  {auth}
                </button>
              ))}
            </div>
          </div>

          {/* Download Format & Card Theme Controls */}
          <div className="pt-5 border-t border-[#EAE2D4] grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div>
              <span className="block text-xs font-bold text-[#342A20] mb-1.5">
                பதிவிறக்க வடிவம் (Download Format):
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDownloadFormat('png')}
                  className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    downloadFormat === 'png'
                      ? 'border-[#8B5A2B] bg-[#241F1A] text-white shadow-xs'
                      : 'border-[#D5C7B5] bg-white text-[#4A3D31] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-[#E0B888]" />
                  <span>கவிதை அட்டை (Card PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDownloadFormat('txt')}
                  className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    downloadFormat === 'txt'
                      ? 'border-[#8B5A2B] bg-[#241F1A] text-white shadow-xs'
                      : 'border-[#D5C7B5] bg-white text-[#4A3D31] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#8B5A2B]" />
                  <span>உரை வடிவம் (Clean TXT)</span>
                </button>
              </div>
            </div>

            {/* Theme Selection for PNG Card */}
            {downloadFormat === 'png' && (
              <div>
                <span className="block text-xs font-bold text-[#342A20] mb-1.5">
                  அட்டை வண்ணத் தீம் (Card Theme):
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardTheme('parchment')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      cardTheme === 'parchment'
                        ? 'border-[#8B5A2B] ring-2 ring-[#8B5A2B]/40 bg-[#FCFAF6] text-[#241F1A] font-bold'
                        : 'border-[#D5C7B5] bg-[#FDFBF7] text-[#555]'
                    }`}
                  >
                    மரபு ஏடு
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('midnight')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      cardTheme === 'midnight'
                        ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 bg-[#0F172A] text-white font-bold'
                        : 'border-[#D5C7B5] bg-[#1E293B] text-white'
                    }`}
                  >
                    நள்ளிரவு
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('rain')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      cardTheme === 'rain'
                        ? 'border-[#14532D] ring-2 ring-[#14532D]/40 bg-[#ECFDF5] text-[#064E3B] font-bold'
                        : 'border-[#D5C7B5] bg-[#E2ECE7] text-[#132A20]'
                    }`}
                  >
                    மழைச்சாரல்
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('terracotta')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      cardTheme === 'terracotta'
                        ? 'border-[#9A3412] ring-2 ring-[#9A3412]/40 bg-[#FFF7ED] text-[#7C2D12] font-bold'
                        : 'border-[#D5C7B5] bg-[#F3E5D9] text-[#78350F]'
                    }`}
                  >
                    செம்மண்
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count & Filter Status */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold text-[#241F1A] font-tamil-serif">
            பதிவிறக்கம் செய்யத் தயாராக உள்ள கவிதைகள் ({filteredPoems.length})
          </h2>
          {authorQuery && (
            <span className="text-xs text-[#8B5A2B] font-semibold">
              ஆசிரியர்: "{authorQuery}"
            </span>
          )}
        </div>

        {/* Poems Cards for Download */}
        {filteredPoems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#D5C7B5] p-8 max-w-lg mx-auto">
            <User className="w-10 h-10 text-[#A89886] mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-[#342A20] font-tamil-serif">
              "{authorQuery || keywordQuery}" என்ற பெயரில் கவிதைகள் இல்லை
            </h3>
            <p className="text-xs text-[#786959] mt-2 mb-5 leading-relaxed font-tamil-sans">
              ஆசிரியர் பெயரை சரிபார்க்கவும் அல்லது மேலே உள்ள ஆசிரியர் பட்டன்களைத் தொட்டு தேர்ந்தெடுக்கவும்.
            </p>
            <button
              type="button"
              onClick={() => {
                setAuthorQuery('');
                setKeywordQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#241F1A] text-white text-xs font-medium hover:bg-[#3E3227]"
            >
              அனைத்து கவிதைகளையும் காட்டுக
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoems.map((poem) => (
              <div
                key={poem.id}
                className="bg-white rounded-2xl border border-[#D5C7B5] hover:border-[#8B5A2B]/40 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A7969] mb-2">
                    <span className="font-semibold text-[#8B5A2B]">{poem.category}</span>
                    <span>{new Date(poem.created_at).toLocaleDateString('ta-IN')}</span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif leading-snug">
                    {poem.title}
                  </h3>

                  <p className="text-xs text-[#6B5C4F] mt-1 font-tamil-sans">
                    ஆசிரியர்: <span className="font-semibold text-[#241F1A]">{poem.author}</span>
                  </p>

                  <div className="mt-4 p-4 rounded-xl bg-[#F8F4EC] border border-[#E9DFCF] font-tamil-serif text-sm leading-relaxed text-[#332A22] whitespace-pre-line line-clamp-4">
                    {poem.content}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EAE2D4] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenPoemModal(poem)}
                    className="flex items-center gap-1 text-xs text-[#7A6B5C] hover:text-[#241F1A] font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>முன்னோட்டம்</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      downloadFormat === 'png' ? handleDownloadPng(poem) : handleDownloadTxt(poem)
                    }
                    disabled={downloadingId === poem.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#241F1A] hover:bg-[#3D332B] disabled:bg-[#8A7C6E] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#E0B888]" />
                    <span>
                      {downloadingId === poem.id
                        ? 'தயாராகிறது...'
                        : downloadFormat === 'png'
                        ? 'அட்டை பதிவிறக்கு (PNG)'
                        : 'உரை பதிவிறக்கு (TXT)'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
