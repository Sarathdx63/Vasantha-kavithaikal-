import React, { useState } from 'react';
import { ShoppingBag, ExternalLink, BookOpen, Star, X } from 'lucide-react';
import { Book } from '../types';

interface BooksSectionProps {
  books: Book[];
  onOpenPreview?: (book: Book) => void;
  externalPreviewBook?: Book | null;
  onCloseExternalPreview?: () => void;
  onGoToPromote?: () => void;
}

export const BooksSection: React.FC<BooksSectionProps> = ({
  books,
  onOpenPreview,
  externalPreviewBook,
  onCloseExternalPreview,
  onGoToPromote,
}) => {
  const [internalBookForPreview, setInternalBookForPreview] = useState<Book | null>(null);

  const selectedBookForPreview = externalPreviewBook !== undefined ? externalPreviewBook : internalBookForPreview;
  const setSelectedBookForPreview = (book: Book | null) => {
    if (externalPreviewBook !== undefined && onCloseExternalPreview) {
      if (!book) onCloseExternalPreview();
    } else {
      setInternalBookForPreview(book);
    }
  };

  // Sample excerpts for preview
  const bookExcerpts: Record<string, string[]> = {
    'கனவுகளின் நிழல்': [
      'இரவின் மௌனத்தை கிழித்துக்கொண்டு',
      'ஒரு மின்மினிப் பூச்சி பறக்கிறது...',
      'அதன் ஒளியில் ஒளிர்கிறது',
      'நான் எழுத மறந்த கவிதையின் முதல் வரி.',
      '',
      'கனவுகள் வெறும் மாயைகள் அல்ல,',
      'அவை நாம் வாழ விரும்பும்',
      'மற்றுமொரு வாழ்வின் நிழல்கள்.',
    ],
    'நினைவுகளின் தீவு': [
      'அலைகள் கரையை முத்தமிட்டு',
      'மீண்டும் கடலுக்கே திரும்புகின்றன.',
      'என் நினைவுகளும் அப்படித்தான்...',
      'உன் நினைவுகளைத் தொட்டுவிட்டு',
      'என் இதயத்தின் ஆழத்திற்கே மூழ்குகின்றன.',
      '',
      'காலம் என்பது ஒரு தீவு,',
      'நாம் அதன் மணல் துகள்கள்.',
    ],
    'மழையின் விரல்கள்': [
      'மழைத் துளிகள் பூமிக்கு அனுப்பும்',
      'காதல் மடல்கள்...',
      'மண்வாசனை உயிர்த்தெழும் போதெல்லாம்',
      'மனிதன் மீண்டும் குழந்தையாகிறான்.',
      '',
      'மேகங்கள் பாடும் தாலாட்டில்',
      'மரங்கள் மெல்லக் கண்மூடுகின்றன.',
    ],
  };

  return (
    <section id="books" className="py-20 bg-[#F7F3EB] border-y border-[#443426]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#8B5A2B] mb-2 font-serif">
            <span>வெளியீடுகள் • Published Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#241F1A] font-tamil-serif tracking-tight">
            வெளியிடப்பட்ட கவிதை நூல்கள்
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6E6052] font-tamil-sans leading-relaxed">
            அச்சு வடிவில் வெளிவந்து வாசகர்களின் மனதை வென்ற தனித்துவமான தமிழ் கவிதைத் தொகுப்புகள். அமேசான் தளத்தில் நேரடியாகப் பெற்றுக்கொள்ளலாம்.
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {books.map((book) => (
            <article
              key={book.id}
              className="group bg-[#FCFAF6] rounded-2xl border border-[#443426]/12 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Book Cover Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#ECE4D8] p-6 flex items-center justify-center">
                <img
                  src={book.cover_url}
                  alt={book.tamil_title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-[#241F1A]/85 backdrop-blur-xs text-[#E5C9A3] text-xs font-medium px-2.5 py-1 rounded-md shadow flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#E5C9A3]" />
                  <span>{book.publication_year}</span>
                </div>
              </div>

              {/* Book Details */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-xs text-[#8B5A2B] font-medium uppercase tracking-wider">
                      {book.title}
                    </span>
                    {book.price_inr && (
                      <span className="text-sm font-semibold text-[#241F1A] font-mono">
                        ₹{book.price_inr}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif group-hover:text-[#8B5A2B] transition-colors">
                    {book.tamil_title}
                  </h3>

                  <p className="text-xs font-medium text-[#6B5C4F] mt-1 font-tamil-sans">
                    ஆசிரியர்: {book.author}
                  </p>

                  <p className="text-xs sm:text-sm text-[#5B4E41] mt-3 font-tamil-sans leading-relaxed line-clamp-3">
                    {book.description}
                  </p>

                  {/* Metadata unboxed text */}
                  <div className="flex items-center gap-2 text-xs text-[#857667] mt-4 pt-3 border-t border-[#EAE2D4]">
                    {book.pages && <span>{book.pages} பக்கங்கள்</span>}
                    {book.pages && <span aria-hidden="true">·</span>}
                    {book.isbn && <span>ISBN: {book.isbn}</span>}
                  </div>
                </div>

                {/* Direct Actions: Buy on Amazon + Preview */}
                <div className="mt-6 pt-2 flex items-center gap-3">
                  <a
                    href={book.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#241F1A] hover:bg-[#FF9900] hover:text-[#111] text-[#FDFBF7] text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 group/btn"
                    title="Buy on Amazon"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#FF9900] group-hover/btn:text-[#111]" />
                    <span className="font-tamil-sans font-semibold">அமேசானில் வாங்குக</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedBookForPreview(book)}
                    className="py-2.5 px-3.5 rounded-xl border border-[#D5C7B5] hover:bg-[#F2ECE1] text-[#4A3D31] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="மாதிரி வாசிக்க (Read Excerpt)"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#8B5A2B]" />
                    <span>மாதிரி</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Author Book Promotion Banner */}
        {onGoToPromote && (
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#241F1A] to-[#3D332B] text-[#FDFBF7] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs uppercase tracking-wider text-[#E0B888] font-bold">
                எழுத்தாளர்களுக்கான பிரத்தியேக வாய்ப்பு
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold font-tamil-serif text-white">
                உங்கள் புத்தகத்தை விளம்பரப்படுத்த வேண்டுமா?
              </h3>
              <p className="text-xs sm:text-sm text-[#D7C7B5] font-tamil-sans max-w-xl">
                உங்கள் கவிதை நூலின் விவரங்கள் மற்றும் அமேசான் நேரடி இணைப்பை உள்ளிட்டு, ஆயிரக்கணக்கான வாசகர்களை உடனடியாகச் சென்றடையுங்கள்.
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToPromote}
              className="px-6 py-3 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-black font-semibold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shadow-md shrink-0"
            >
              உங்கள் புத்தகத்தை விளம்பரப்படுத்தவும் →
            </button>
          </div>
        )}
      </div>

      {/* Book Excerpt Modal */}
      {selectedBookForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140F0A]/75 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FCFAF6] border border-[#443426]/20 shadow-2xl p-6 sm:p-8 text-[#241F1A]">
            <button
              type="button"
              onClick={() => setSelectedBookForPreview(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#7A6B5C] hover:text-[#241F1A] hover:bg-[#F0E8DC] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#EAE1D3]">
              <img
                src={selectedBookForPreview.cover_url}
                alt={selectedBookForPreview.tamil_title}
                referrerPolicy="no-referrer"
                className="w-16 h-22 object-cover rounded-md shadow"
              />
              <div>
                <span className="text-xs text-[#8B5A2B] font-medium uppercase">மாதிரி கவிதைகள் • Sample Verses</span>
                <h3 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif">
                  {selectedBookForPreview.tamil_title}
                </h3>
                <p className="text-xs text-[#6B5D4E] mt-0.5">
                  {selectedBookForPreview.author} • {selectedBookForPreview.publication_year}
                </p>
              </div>
            </div>

            <div className="bg-[#F8F4EC] p-6 rounded-xl border border-[#E4D9C8] font-tamil-serif text-sm sm:text-base leading-relaxed text-[#2C231B] text-center space-y-1">
              {(bookExcerpts[selectedBookForPreview.tamil_title] || [
                'மௌனத்தின் மடியில் தவழும் வரிகள்...',
                'காலத்தின் சுவடுகளை கவிதைகளாக செதுக்கும் அனுபவம்.',
                'முழு நூலையும் அமேசானில் பெற்று வாசியுங்கள்.',
              ]).map((line, idx) => (
                <p key={idx} className={line === '' ? 'h-3' : ''}>
                  {line}
                </p>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAE1D3] flex items-center justify-between gap-4">
              <span className="text-xs text-[#8A7969]">
                விலை: ₹{selectedBookForPreview.price_inr} (அமேசான் இந்தியா)
              </span>

              <a
                href={selectedBookForPreview.amazon_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-5 rounded-xl bg-[#241F1A] hover:bg-[#FF9900] hover:text-[#111] text-[#FDFBF7] text-xs sm:text-sm font-semibold transition-all shadow flex items-center gap-2 group/modalbtn"
              >
                <ShoppingBag className="w-4 h-4 text-[#FF9900] group-hover/modalbtn:text-[#111]" />
                <span>அமேசானில் இப்போது வாங்குக</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
