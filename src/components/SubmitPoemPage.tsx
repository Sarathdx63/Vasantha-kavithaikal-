import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  Feather,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface SubmitPoemPageProps {
  onBackToHome: () => void;
  onPoemSubmitted: () => void;
}

export const SubmitPoemPage: React.FC<SubmitPoemPageProps> = ({
  onBackToHome,
  onPoemSubmitted,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('இயற்கை');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = [
    'இயற்கை',
    'காதல்',
    'வாழ்க்கை',
    'தத்துவம்',
    'தமிழ் பெருமை',
    'சமூகம்',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !content.trim()) {
      setError('தயவுசெய்து தலைப்பு, ஆசிரியர் பெயர் மற்றும் கவிதை வரிகளை முழுமையாக நிரப்பவும்.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/poems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          email: email.trim() || undefined,
          category,
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message || 'உங்கள் கவிதை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!');
        onPoemSubmitted();
      } else {
        setError(data.error || 'கவிதையைச் சமர்ப்பிப்பதில் பிழை ஏற்பட்டது.');
      }
    } catch {
      setError('சேவையக இணைப்புப் பிழை. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7A6B5C] hover:text-[#241F1A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>முகப்புக்குத் திரும்பு (Back to Home)</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C9A3]/25 text-[#73431D] text-xs font-semibold mb-3">
            <Feather className="w-3.5 h-3.5" />
            <span>படைப்பரங்கம் • Creator Submission Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F1914] font-tamil-serif tracking-tight">
            உங்கள் கவிதையை சேர்க்கவும்
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#6E6052] font-tamil-sans leading-relaxed">
            உங்கள் எண்ணங்களில் உதித்த கவிதை முத்துக்களை வசந்த கவிதைகள் வாசகர்களோடு பகிர்ந்துகொள்ளுங்கள். சமர்ப்பிக்கப்படும் கவிதைகள் ஆசிரியர் குழுவின் ஆய்வுக்குப் பிறகு நேரலையில் வெளியிடப்படும்.
          </p>
        </div>

        {/* Success View */}
        {success ? (
          <div className="bg-white rounded-3xl border border-[#DDD3C2] p-8 sm:p-12 text-center shadow-md max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1F1914] font-tamil-serif">
              கவிதை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!
            </h2>
            <p className="text-sm text-[#6E6052] mt-3 leading-relaxed max-w-md mx-auto">
              {success}
            </p>
            <div className="mt-6 p-4 rounded-xl bg-[#F8F4EC] border border-[#E9DFCF] text-xs text-[#7A6B5C] text-left space-y-2">
              <p>📌 <strong>நிலை:</strong> நிர்வாகியின் ஆய்வில் உள்ளது (Pending Moderation)</p>
              <p>📌 <strong>தலைப்பு:</strong> {title}</p>
              <p>📌 <strong>ஆசிரியர்:</strong> {author}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setSuccess(null);
                  setTitle('');
                  setContent('');
                }}
                className="px-5 py-2.5 rounded-xl border border-[#D5C7B5] text-[#342A20] text-xs font-medium hover:bg-[#F2ECE1]"
              >
                மற்றொரு கவிதை எழுத
              </button>
              <button
                type="button"
                onClick={onBackToHome}
                className="px-6 py-2.5 rounded-xl bg-[#241F1A] hover:bg-[#3E3227] text-white text-xs font-semibold shadow-sm"
              >
                முகப்பு பக்கத்திற்குச் செல்ல
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#DDD3C2] p-6 sm:p-10 shadow-sm">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Author Name and Contact Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#342A20] mb-1.5">
                    ஆசிரியர் / உங்கள் பெயர் *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="உதாரணம்: பாரதி பிரியன்"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 outline-none"
                  />
                  <span className="text-[11px] text-[#8C7D6E] mt-1 block">
                    கவிதையுடன் வாசகர்களுக்குக் காட்டப்படும் பெயர்
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#342A20] mb-1.5">
                    மின்னஞ்சல் (தொடர்புக்கு மட்டும்)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="author@example.com"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 outline-none"
                  />
                  <span className="text-[11px] text-[#8C7D6E] mt-1 block">
                    கவிதை ஏற்கப்படும் போது தகவல் தெரிவிக்க உதவும் (ரகசியமாக வைக்கப்படும்)
                  </span>
                </div>
              </div>

              {/* Row 2: Title and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#342A20] mb-1.5">
                    கவிதை தலைப்பு *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="உதாரணம்: விடியலின் முதல் சுவாசம்"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 outline-none font-tamil-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#342A20] mb-1.5">
                    கவிதை வகை / களம் *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] font-medium focus:ring-2 focus:ring-[#8B5A2B]/30 outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Verses Editor / Preview Switcher */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#342A20]">
                    கவிதை வரிகள் (Poem Verses) *
                  </label>
                  <div className="flex items-center gap-1 bg-[#F1EAE0] p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('edit')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'edit'
                          ? 'bg-white text-[#241F1A] font-bold shadow-2xs'
                          : 'text-[#6C5D4F] hover:text-[#241F1A]'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>எழுதுக (Editor)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'preview'
                          ? 'bg-white text-[#241F1A] font-bold shadow-2xs'
                          : 'text-[#6C5D4F] hover:text-[#241F1A]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>முன்னோட்டம் (Preview)</span>
                    </button>
                  </div>
                </div>

                {activeTab === 'edit' ? (
                  <div>
                    <textarea
                      required
                      rows={10}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="உங்கள் கவிதை வரிகளை இங்கே எழுதவும்...

ஒவ்வொரு வரியையும் அடுத்தடுத்து எழுத Enter தட்டவும்.
பத்திகளைப் பிரிக்க இருமுறை Enter தட்டவும்."
                      className="w-full p-4 text-base font-tamil-serif rounded-2xl border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 outline-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-xs text-[#8C7D6E] mt-2 px-1">
                      <span>வரிகள் எண்ணிக்கை: {content.split('\n').filter((l) => l.trim()).length}</span>
                      <span>எழுத்துக்கள்: {content.length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[260px] p-8 rounded-2xl bg-[#F8F4EC] border border-[#E4D9C8] font-tamil-serif text-center space-y-2">
                    <span className="text-xs text-[#8B5A2B] uppercase font-bold tracking-wider">
                      {category}
                    </span>
                    <h3 className="text-2xl font-bold text-[#1F1914] font-tamil-serif">
                      {title || 'கவிதை தலைப்பு'}
                    </h3>
                    <p className="text-xs text-[#6B5C4F] italic mb-6">
                      — {author || 'கவிஞர் பெயர்'}
                    </p>
                    <div className="text-base sm:text-lg leading-loose text-[#2C231B] whitespace-pre-line max-w-lg mx-auto">
                      {content || '(கவிதை வரிகள் எழுதப்படவில்லை)'}
                    </div>
                  </div>
                )}
              </div>

              {/* Guidelines Box */}
              <div className="p-4 bg-[#F5ECE0] rounded-2xl border border-[#E6D8C6] text-xs text-[#6E5E4E] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[#4A3D30] mb-1">
                  <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
                  <span>கவிதை சமர்ப்பிப்பு நெறிமுறைகள்:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] sm:text-xs">
                  <li>படைப்புகள் உங்களுடைய சொந்த அசல் படைப்பாக இருக்க வேண்டும்.</li>
                  <li>சமர்ப்பிக்கப்பட்ட பின் நிர்வாகியின் ஆய்வுக்குப் பிறகு 24 மணி நேரத்திற்குள் நேரலையில் வெளியிடப்படும்.</li>
                  <li>வெளியிடப்பட்ட கவிதைகளை வாசகர்கள் படிக்கவும், உரை அல்லது கவிதை அட்டையாகப் பதிவிறக்கவும் இயலும்.</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#EAE2D4]">
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="px-5 py-3 rounded-xl border border-[#D5C7B5] text-[#4A3D31] text-xs sm:text-sm font-medium hover:bg-[#F2ECE1] transition-colors"
                >
                  ரத்து செய் (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={loading || !title.trim() || !author.trim() || !content.trim()}
                  className="px-8 py-3 rounded-xl bg-[#241F1A] hover:bg-[#3E3227] disabled:bg-[#A89A89] text-[#FDFBF7] text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-[#E0B888]" />
                  <span>{loading ? 'சமர்ப்பிக்கப்படுகிறது...' : 'கவிதையைச் சமர்ப்பிக்கவும்'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
