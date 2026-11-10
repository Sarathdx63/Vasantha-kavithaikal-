import React, { useState } from 'react';
import { X, Send, Feather, CheckCircle2, AlertCircle, Eye, Edit3 } from 'lucide-react';

interface PoemSubmitModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

export const PoemSubmitModal: React.FC<PoemSubmitModalProps> = ({
  onClose,
  onSubmitted,
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
      setError('தயவுசெய்து தலைப்பு, ஆசிரியர் பெயர் மற்றும் கவிதை வரிகளை நிரப்பவும்.');
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
        setTimeout(() => {
          onSubmitted();
          onClose();
        }, 3000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#120E0A]/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#FCFAF6] border border-[#443426]/20 shadow-2xl p-6 sm:p-8 text-[#241F1A]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7A6B5C] hover:text-[#241F1A] hover:bg-[#EFE6D9] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pb-4 border-b border-[#EAE2D4]">
          <div className="flex items-center gap-2 text-xs text-[#8B5A2B] font-semibold tracking-wider uppercase mb-1">
            <Feather className="w-4 h-4" />
            <span>வாசகர் படைப்பரங்கம்</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F1914] font-tamil-serif">
            உங்கள் கவிதையை எழுதுங்கள்
          </h2>
          <p className="text-xs sm:text-sm text-[#6C5D4F] mt-1 font-tamil-sans">
            உங்கள் தமிழ் கவிதை வரிகளை வசந்த கவிதைகள் தளத்தில் வெளியிட சமர்ப்பிக்கவும். சமர்ப்பிக்கப்படும் படைப்புகள் நிர்வாகியின் ஒப்புதலுக்குப் பிறகு நேரலையில் தோன்றும்.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-8 text-center bg-[#F3ECE0] rounded-xl border border-[#DDCFBD] my-6">
            <CheckCircle2 className="w-12 h-12 text-[#8B5A2B] mx-auto mb-3" />
            <h3 className="text-xl font-serif font-bold text-[#241F1A] font-tamil-serif">
              கவிதை சமர்ப்பிக்கப்பட்டது!
            </h3>
            <p className="text-xs sm:text-sm text-[#6C5D4F] mt-2 max-w-md mx-auto leading-relaxed">
              {success}
            </p>
            <p className="text-xs text-[#8C7D6E] mt-4 italic">
              கவிதை நிலை: <span className="font-semibold text-[#8B5A2B]">நிலுவையில் உள்ளது (Pending Review)</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Author and Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#44372C] mb-1.5">
                  கவிஞர் / உங்கள் பெயர் *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="உதாரணம்: கவிதா பாரதி"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44372C] mb-1.5">
                  மின்னஞ்சல் (தொடர்புக்கு மட்டும் - ரகசியமானது)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] outline-none"
                />
              </div>
            </div>

            {/* Title and Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#44372C] mb-1.5">
                  கவிதை தலைப்பு *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="உதாரணம்: நள்ளிரவு நிலா"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44372C] mb-1.5">
                  கவிதை வகை *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabs for Edit vs Preview */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#44372C]">
                  கவிதை வரிகள் (Poem Verses) *
                </label>
                <div className="flex items-center gap-1 bg-[#F1EAE0] p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === 'edit'
                        ? 'bg-white text-[#241F1A] shadow-xs font-medium'
                        : 'text-[#6C5D4F] hover:text-[#241F1A]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>எழுதுக</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-white text-[#241F1A] shadow-xs font-medium'
                        : 'text-[#6C5D4F] hover:text-[#241F1A]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>முன்னோட்டம்</span>
                  </button>
                </div>
              </div>

              {activeTab === 'edit' ? (
                <div>
                  <textarea
                    required
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="உங்கள் அழகான கவிதை வரிகளை இங்கே தட்டச்சு செய்யவும்...
ஒவ்வொரு வரியையும் அடுத்தடுத்து எழுத Enter அழுத்தவும்."
                    className="w-full p-3.5 text-sm sm:text-base font-tamil-serif rounded-xl border border-[#D5C7B5] bg-white text-[#241F1A] placeholder-[#9E9080] focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#8C7D6E] mt-1 px-1">
                    <span>வரிகள்: {content.split('\n').filter((l) => l.trim()).length}</span>
                    <span>எழுத்துக்கள்: {content.length}</span>
                  </div>
                </div>
              ) : (
                <div className="min-h-[200px] p-6 rounded-xl bg-[#F8F4EC] border border-[#E4D9C8] font-tamil-serif text-center space-y-1">
                  <h4 className="text-lg font-bold text-[#241F1A] mb-1 font-tamil-serif">
                    {title || 'கவிதை தலைப்பு'}
                  </h4>
                  <p className="text-xs text-[#8B5A2B] italic mb-4">
                    — {author || 'உங்கள் பெயர்'}
                  </p>
                  <div className="text-sm leading-relaxed text-[#332A22] whitespace-pre-line">
                    {content || '(கவிதை வரிகள் இன்னும் எழுதப்படவில்லை)'}
                  </div>
                </div>
              )}
            </div>

            {/* Submission notice */}
            <div className="p-3 bg-[#F4EDE2] rounded-xl text-[11px] text-[#6E5E4E] leading-relaxed">
              💡 <strong>குறிப்பு:</strong> அசல் படைப்புகளை மட்டுமே சமர்ப்பிக்கவும். சமர்ப்பிக்கப்பட்ட கவிதைகள் எங்கள் இலக்கிய நடுவர் குழுவால் (Admin) ஆய்வு செய்யப்பட்டு சில மணிநேரங்களில் நேரலையில் வெளியிடப்படும்.
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#D5C7B5] text-[#5B4E41] text-xs sm:text-sm font-medium hover:bg-[#F2ECE1] transition-colors"
              >
                ரத்து செய்
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !author.trim() || !content.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#241F1A] hover:bg-[#3D332B] disabled:bg-[#A89A89] text-[#FDFBF7] text-xs sm:text-sm font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-[#E0B888]" />
                <span>{loading ? 'சமர்ப்பிக்கப்படுகிறது...' : 'கவிதையை சமர்ப்பிக்க'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
