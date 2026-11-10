import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Send,
  HelpCircle,
  Eye,
} from 'lucide-react';

const cleanClientInput = (str: string) => str.trim().replace(/[<>]/g, '');

interface PromoteBookPageProps {
  onBackToHome: () => void;
  onGoToBooks: () => void;
}

const PRESET_COVERS = [
  {
    name: 'கனவுகளின் நிழல் (Vintage Poetic)',
    url: '/src/assets/images/book_cover_kanavugal_1794242034346.jpg',
  },
  {
    name: 'நினைவுகளின் தீவு (Island of Memories)',
    url: '/src/assets/images/book_cover_ninaivugal_1794242034529.jpg',
  },
  {
    name: 'மழையின் விரல்கள் (Raindrops & Nature)',
    url: '/src/assets/images/book_cover_mazhai_1794242035067.jpg',
  },
];

export const PromoteBookPage: React.FC<PromoteBookPageProps> = ({
  onBackToHome,
  onGoToBooks,
}) => {
  const [tamilTitle, setTamilTitle] = useState('');
  const [englishTitle, setEnglishTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('2026');
  const [price, setPrice] = useState('250');
  const [pages, setPages] = useState('160');
  const [isbn, setIsbn] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeCover = customCoverUrl.trim() ? customCoverUrl.trim() : coverUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tamilTitle.trim() || !author.trim() || !amazonUrl.trim()) {
      setError('புத்தகத்தின் தமிழ் தலைப்பு, ஆசிரியர் பெயர் மற்றும் அமேசான் இணைப்பு ஆகியவை கட்டாயமானவை.');
      return;
    }

    if (!amazonUrl.startsWith('http://') && !amazonUrl.startsWith('https://')) {
      setError('தயவுசெய்து முழுமையான இணைய முகவரியை உள்ளிடவும் (e.g. https://www.amazon.in/dp/...)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/books/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tamil_title: cleanClientInput(tamilTitle),
          title: englishTitle.trim() ? cleanClientInput(englishTitle) : cleanClientInput(tamilTitle),
          author: cleanClientInput(author),
          amazon_url: amazonUrl.trim(),
          cover_url: activeCover,
          description: cleanClientInput(description),
          publication_year: parseInt(year, 10) || 2026,
          price_inr: parseInt(price, 10) || 250,
          pages: parseInt(pages, 10) || 160,
          isbn: isbn.trim() ? cleanClientInput(isbn) : '',
          contact_email: email.trim() ? cleanClientInput(email) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'புத்தகத்தை சமர்ப்பிப்பதில் பிழை ஏற்பட்டது.');
      }

      setSuccess(data.message || 'உங்கள் புத்தகம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! நிர்வாகி ஒப்புதலுக்குப் பிறகு நேரலையில் அமேசான் இணைப்புடன் காட்சிப்படுத்தப்படும்.');
      // Reset form
      setTamilTitle('');
      setEnglishTitle('');
      setDescription('');
      setAmazonUrl('');
      setCustomCoverUrl('');
      setIsbn('');
    } catch (err: any) {
      setError(err.message || 'வலைப்பின்னல் பிழை. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241F1A] pb-24">
      {/* Top Banner & Navigation */}
      <div className="bg-[#241F1A] text-[#FDFBF7] border-b border-[#443426]/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm text-[#CBBBA8] hover:text-[#E0B888] transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>முகப்புக்குத் திரும்பு (Home)</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#8B5A2B]/40 text-[#E0B888] border border-[#8B5A2B]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>எழுத்தாளர்கள் & பதிப்பகங்களுக்கான தளம்</span>
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#FDFBF7] font-tamil-serif tracking-tight">
            உங்கள் புத்தகத்தை விளம்பரப்படுத்தவும்
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#D7C7B5] font-tamil-sans max-w-2xl leading-relaxed">
            உங்கள் கவிதை அல்லது இலக்கிய நூலை ஆயிரக்கணக்கான தமிழ் வாசகர்களிடம் கொண்டு செல்லுங்கள்.
            உங்கள் அமேசான் நேரடி வாங்கல் இணைப்புடன் (Amazon Direct Buy Link) நமது தளத்தில் பிரத்தியேகமாக காட்சிப்படுத்தப்படும்.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Success Modal / Banner */}
        {success && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-serif font-bold text-base font-tamil-serif">
                  நூல் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 font-tamil-sans mt-0.5">
                  {success}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                மற்றொரு நூல் சேர்க்க
              </button>
              <button
                type="button"
                onClick={onGoToBooks}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                நூல்கள் பக்கம் பார்க்க
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 font-bold ml-2 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD3C2] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D4] mb-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#241F1A] font-tamil-serif">
                  புத்தக விவர படிவம் (Book Promotion Form)
                </h2>
                <p className="text-xs text-[#7A6B5C] font-tamil-sans mt-0.5">
                  * குறியிடப்பட்டவை கட்டாயமான புலங்கள்
                </p>
              </div>
              <BookOpen className="w-6 h-6 text-[#8B5A2B]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Titles Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] font-tamil-sans mb-1.5">
                    நூலின் தமிழ் பெயர் *
                  </label>
                  <input
                    type="text"
                    required
                    value={tamilTitle}
                    onChange={(e) => setTamilTitle(e.target.value)}
                    placeholder="உதாரணம்: விடியலின் ராகங்கள்"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] outline-none focus:ring-2 focus:ring-[#8B5A2B]/40 focus:bg-white font-tamil-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] font-tamil-sans mb-1.5">
                    ஆங்கிலத் தலைப்பு (English Title)
                  </label>
                  <input
                    type="text"
                    value={englishTitle}
                    onChange={(e) => setEnglishTitle(e.target.value)}
                    placeholder="e.g. Melodies of Dawn"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] outline-none focus:ring-2 focus:ring-[#8B5A2B]/40 focus:bg-white font-sans"
                  />
                </div>
              </div>

              {/* Author & Amazon Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] font-tamil-sans mb-1.5">
                    ஆசிரியர் / பதிப்பகப் பெயர் *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="உதாரணம்: கவிஞர் இளவேனில்"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] outline-none focus:ring-2 focus:ring-[#8B5A2B]/40 focus:bg-white font-tamil-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] font-tamil-sans mb-1.5">
                    அமேசான் வாங்கல் இணைப்பு (Amazon URL) *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={amazonUrl}
                      onChange={(e) => setAmazonUrl(e.target.value)}
                      placeholder="https://www.amazon.in/dp/B0..."
                      className="w-full pl-3.5 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] outline-none focus:ring-2 focus:ring-[#8B5A2B]/40 focus:bg-white font-mono"
                    />
                    <ShoppingBag className="w-4 h-4 text-amber-700 absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Cover Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3D30] font-tamil-sans mb-1.5">
                  நூல் அட்டைப் படம் (Cover Image)
                </label>
                <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setCoverUrl(preset.url);
                        setCustomCoverUrl('');
                      }}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        coverUrl === preset.url && !customCoverUrl
                          ? 'border-[#8B5A2B] bg-[#F6EFE6] ring-1 ring-[#8B5A2B]'
                          : 'border-[#DDD3C2] bg-white hover:border-[#8B5A2B]/40'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-12 h-16 object-cover rounded shadow-xs"
                      />
                      <span className="text-[10px] text-center font-medium line-clamp-1 text-[#4A3D30]">
                        {preset.name.split(' (')[0]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#7A6B5C]">அல்லது உங்கள் சொந்த அட்டைப் படம் இணைய முகவரி (URL):</span>
                  </div>
                  <input
                    type="url"
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    placeholder="https://images.example.com/my-book-cover.jpg"
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] outline-none focus:ring-2 focus:ring-[#8B5A2B]/40"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3D30] font-tamil-sans mb-1.5">
                  நூல் பற்றிய சிறு குறிப்பு (Description / Summary)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="நூலின் சாராம்சம், கவிதைகளின் சுவை, பின்னணி போன்ற விவரங்களை உள்ளிடுங்கள்..."
                  className="w-full p-3.5 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] outline-none focus:ring-2 focus:ring-[#8B5A2B]/40 focus:bg-white font-tamil-sans leading-relaxed"
                />
              </div>

              {/* Year, Price, Pages */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] mb-1 font-tamil-sans">
                    ஆண்டு (Year)
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] mb-1 font-tamil-sans">
                    விலை (Price ₹)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] mb-1 font-tamil-sans">
                    பக்கங்கள்
                  </label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7]"
                  />
                </div>
              </div>

              {/* Contact Email & ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] mb-1 font-tamil-sans">
                    தொடர்பு மின்னஞ்சல் (Email)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="author@example.com"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] mb-1 font-tamil-sans">
                    ISBN எண் (விருப்பத்தேர்வு)
                  </label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-0-123456-47-2"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE2D4]">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#241F1A] hover:bg-[#3D332B] text-[#FDFBF7] text-sm sm:text-base font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {loading ? 'சமர்ப்பிக்கப்படுகிறது...' : 'நூலை விளம்பரப்படுத்த சமர்ப்பிக்கவும்'}
                  </span>
                </button>
                <p className="mt-2 text-center text-[11px] text-[#7A6B5C] font-tamil-sans">
                  சமர்ப்பித்த பிறகு எங்கள் நிர்வாகி குழு சரிபார்த்து தளத்தில் உடனே நேரலையில் காட்சிப்படுத்தும்.
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Live Amazon Card Preview (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DDD3C2] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D4] mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8B5A2B]">
                  <Eye className="w-4 h-4" />
                  <span>நேரலை வாசகர் அட்டை மாதிரிக் காட்சி (Live Preview)</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  Amazon Link
                </span>
              </div>

              {/* The Styled Book Card Preview */}
              <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E4D9C8] flex flex-col justify-between shadow-2xs">
                <div className="flex gap-4">
                  <div className="w-24 sm:w-28 shrink-0">
                    <img
                      src={activeCover}
                      alt={tamilTitle || 'Book Cover'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRESET_COVERS[0].url;
                      }}
                      className="w-full aspect-[2/3] object-cover rounded-lg shadow-md border border-white"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase bg-[#8B5A2B]/15 text-[#73431D] px-2 py-0.5 rounded font-semibold">
                      {year || '2026'} • {pages || '160'} பக்கங்கள்
                    </span>

                    <h3 className="mt-1.5 text-base sm:text-lg font-serif font-bold text-[#1F1914] font-tamil-serif leading-snug line-clamp-2">
                      {tamilTitle || 'புத்தகத்தின் தமிழ் தலைப்பு'}
                    </h3>

                    <p className="text-xs text-[#7A6B5C] italic line-clamp-1">
                      {englishTitle || 'English Subtitle / Translation'}
                    </p>

                    <p className="mt-1 text-xs text-[#4A3D30] font-tamil-sans">
                      ஆசிரியர்:{' '}
                      <span className="font-semibold text-[#241F1A]">
                        {author || 'ஆசிரியர் பெயர்'}
                      </span>
                    </p>

                    <div className="mt-2 text-sm font-bold font-mono text-[#8B5A2B]">
                      ₹{price || '250'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DECة] border-[#DDD3C2]/60">
                  <p className="text-xs text-[#5E5145] font-tamil-sans line-clamp-3 leading-relaxed">
                    {description ||
                      'இங்கு உங்கள் நூலின் சிறப்பு அறிமுகக் குறிப்பு வாசகர்களுக்குத் தெளிவாகக் காட்சிப்படுத்தப்படும்.'}
                  </p>

                  {/* Amazon Direct CTA Button */}
                  <a
                    href={amazonUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!amazonUrl) e.preventDefault();
                    }}
                    className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      amazonUrl
                        ? 'bg-[#FF9900] hover:bg-[#E68A00] text-black shadow-sm font-medium'
                        : 'bg-amber-100 text-amber-900 opacity-70 pointer-events-none'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-black" />
                    <span>அமேசானில் வாங்க (Buy on Amazon)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {amazonUrl && (
                    <span className="block text-[10px] text-center text-[#7A6B5C] mt-1.5 truncate">
                      இணைப்பு: {amazonUrl}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Benefit Box */}
            <div className="p-5 rounded-2xl bg-[#F6EFE6] border border-[#DDD3C2] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#73431D] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>விளம்பரப்படுத்துவதன் நன்மைகள்</span>
              </h4>
              <ul className="text-xs text-[#5E5145] font-tamil-sans space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5A2B] font-bold">✓</span>
                  <span>வாசகர்கள் நேரடியாக அமேசான் தளம் சென்று உங்கள் நூலை வாங்குவதற்கான நேரடி வசதி.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5A2B] font-bold">✓</span>
                  <span>Google தேடுதளத்தில் உங்கள் நூலின் பெயர் மற்றும் கவிதைகள் எளிதில் கண்டறியும் வசதி (SEO).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5A2B] font-bold">✓</span>
                  <span>ஆசிரியர் மற்றும் தலைப்பு வாரியான விரிவான தேடலில் உங்கள் நூல் சேர்க்கப்படும்.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
