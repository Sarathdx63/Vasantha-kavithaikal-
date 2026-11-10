import React from 'react';
import {
  Search,
  BookOpen,
  ShoppingBag,
  Heart,
  FileText,
  ExternalLink,
  RotateCcw,
  BookMarked,
  Feather,
  Filter,
} from 'lucide-react';
import { Poem, Book, SearchContentType } from '../types';
import { extractMatchedSnippet } from '../utils/search';

interface SearchResultsSectionProps {
  query: string;
  contentType: SearchContentType;
  onSelectContentType: (type: SearchContentType) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedAuthor: string;
  onSelectAuthor: (author: string) => void;
  sortBy: 'relevance' | 'newest' | 'popular' | 'title';
  onSelectSortBy: (sort: 'relevance' | 'newest' | 'popular' | 'title') => void;
  matchedPoems: Poem[];
  matchedBooks: Book[];
  availableAuthors: string[];
  availableCategories: string[];
  onClearFilters: () => void;
  onOpenPoemModal: (poem: Poem) => void;
  onLikePoem: (poemId: number) => void;
  onOpenBookPreview: (book: Book) => void;
  onOpenSubmitModal: () => void;
}

export const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  query,
  contentType,
  onSelectContentType,
  selectedCategory,
  onSelectCategory,
  selectedAuthor,
  onSelectAuthor,
  sortBy,
  onSelectSortBy,
  matchedPoems,
  matchedBooks,
  availableAuthors,
  availableCategories,
  onClearFilters,
  onOpenPoemModal,
  onLikePoem,
  onOpenBookPreview,
  onOpenSubmitModal,
}) => {
  const isFilterActive =
    Boolean(query.trim()) ||
    (selectedCategory !== 'அனைத்தும்' && selectedCategory !== 'all') ||
    (selectedAuthor !== 'அனைத்தும்' && selectedAuthor !== 'all') ||
    contentType !== 'all';

  if (!isFilterActive) return null;

  const totalMatches = matchedPoems.length + matchedBooks.length;

  return (
    <section id="search-results" className="py-12 bg-[#F6F1E7] border-b border-[#443426]/12 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Header Bar */}
        <div className="bg-white rounded-2xl border border-[#D5C7B5] p-5 sm:p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B5A2B]">
                <Search className="w-3.5 h-3.5" />
                <span>தேடல் & வடிகட்டல் முடிவுகள் (Search Results)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#241F1A] font-tamil-serif mt-1">
                {query.trim() ? (
                  <>
                    <span>"{query}"</span>
                    <span className="text-sm font-normal text-[#6E5F52] ml-2">
                      ({totalMatches} பொருத்தமான முடிவுகள்)
                    </span>
                  </>
                ) : (
                  <span>வடிகட்டப்பட்ட முடிவுகள் ({totalMatches})</span>
                )}
              </h2>
            </div>

            {/* Quick Reset Button */}
            <button
              type="button"
              onClick={onClearFilters}
              className="self-start lg:self-auto flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#7A3E1D] hover:text-[#522912] bg-[#F4E9DC] hover:bg-[#EBDDCB] rounded-lg transition-colors cursor-pointer border border-[#8B5A2B]/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>வடிகட்டிகளை மீட்டமை (Clear Filters)</span>
            </button>
          </div>

          {/* Filter Dropdowns Strip */}
          <div className="mt-5 pt-4 border-t border-[#EAE2D4] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Content Type Filter */}
            <div>
              <label htmlFor="filter-type" className="block text-[11px] font-semibold text-[#5B4E41] uppercase mb-1">
                உள்ளடக்க வகை (Type)
              </label>
              <select
                id="filter-type"
                value={contentType}
                onChange={(e) => onSelectContentType(e.target.value as SearchContentType)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] font-medium focus:ring-1 focus:ring-[#8B5A2B] outline-none cursor-pointer"
              >
                <option value="all">அனைத்தும் ({totalMatches})</option>
                <option value="poems">கவிதைகள் மட்டும் ({matchedPoems.length})</option>
                <option value="books">நூல்கள் மட்டும் ({matchedBooks.length})</option>
              </select>
            </div>

            {/* 2. Category / Genre Filter */}
            <div>
              <label htmlFor="filter-category" className="block text-[11px] font-semibold text-[#5B4E41] uppercase mb-1">
                வகை / களம் (Genre)
              </label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] font-medium focus:ring-1 focus:ring-[#8B5A2B] outline-none cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Author Filter */}
            <div>
              <label htmlFor="filter-author" className="block text-[11px] font-semibold text-[#5B4E41] uppercase mb-1">
                படைப்பாளர் (Author)
              </label>
              <select
                id="filter-author"
                value={selectedAuthor}
                onChange={(e) => onSelectAuthor(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] font-medium focus:ring-1 focus:ring-[#8B5A2B] outline-none cursor-pointer"
              >
                {availableAuthors.map((auth) => (
                  <option key={auth} value={auth}>
                    {auth}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Sort By Filter */}
            <div>
              <label htmlFor="filter-sort" className="block text-[11px] font-semibold text-[#5B4E41] uppercase mb-1">
                வரிசைப்படுத்து (Sort)
              </label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => onSelectSortBy(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C7B5] bg-[#FDFBF7] text-[#241F1A] font-medium focus:ring-1 focus:ring-[#8B5A2B] outline-none cursor-pointer"
              >
                <option value="relevance">பொருத்தம் (Relevance)</option>
                <option value="newest">புதியவை (Newest)</option>
                <option value="popular">பிரபலமானவை (Popular)</option>
                <option value="title">அகரவரிசை (Title A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Zero Results State */}
        {totalMatches === 0 ? (
          <div className="py-14 text-center bg-white rounded-2xl border border-[#D5C7B5] p-8 max-w-lg mx-auto shadow-xs">
            <Search className="w-10 h-10 text-[#A89886] mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-[#342A20] font-tamil-serif">
              முடிவுகள் எதுவும் காணப்படவில்லை
            </h3>
            <p className="text-xs sm:text-sm text-[#786959] mt-2 mb-5 leading-relaxed font-tamil-sans">
              நீங்கள் தேடிய <strong>"{query}"</strong> என்ற சொல்லிற்கோ அல்லது தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கோ பொருத்தமான கவிதைகளோ, நூல்களோ கிடைக்கவில்லை.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClearFilters}
                className="px-4 py-2 rounded-xl bg-[#241F1A] text-[#FDFBF7] text-xs font-medium hover:bg-[#3D3329] transition-colors"
              >
                வடிகட்டிகளை மீட்டமைக்க (Reset)
              </button>
              <button
                type="button"
                onClick={onOpenSubmitModal}
                className="px-4 py-2 rounded-xl border border-[#D5C7B5] text-[#342A20] text-xs font-medium hover:bg-[#F4ECE1] transition-colors"
              >
                புதிய கவிதை எழுத
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. MATCHED BOOKS (If contentType !== 'poems' and matchedBooks.length > 0) */}
            {contentType !== 'poems' && matchedBooks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookMarked className="w-5 h-5 text-[#8B5A2B]" />
                  <h3 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif">
                    கண்டறியப்பட்ட கவிதை நூல்கள் ({matchedBooks.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedBooks.map((book) => (
                    <article
                      key={`book-${book.id}`}
                      className="bg-white rounded-xl border border-[#D5C7B5] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex gap-4"
                    >
                      <img
                        src={book.cover_url}
                        alt={book.tamil_title}
                        referrerPolicy="no-referrer"
                        className="w-20 h-28 object-cover rounded-md shadow-xs shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-[#8B5A2B] font-semibold uppercase tracking-wider block">
                            நூல் • Book ({book.publication_year})
                          </span>
                          <h4 className="text-base font-serif font-bold text-[#1F1914] font-tamil-serif leading-snug">
                            {book.tamil_title}
                          </h4>
                          <p className="text-xs text-[#6B5C4F] mt-0.5">
                            {book.author}
                          </p>
                          <p className="text-xs text-[#5B4E41] mt-2 line-clamp-2 leading-relaxed">
                            {query.trim()
                              ? extractMatchedSnippet(book.description, query, 70)
                              : book.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#EAE2D4] flex items-center justify-between gap-2">
                          {book.price_inr && (
                            <span className="text-xs font-bold text-[#241F1A] font-mono">
                              ₹{book.price_inr}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <button
                              type="button"
                              onClick={() => onOpenBookPreview(book)}
                              className="px-2.5 py-1 text-xs rounded border border-[#D5C7B5] hover:bg-[#F4ECE1] text-[#4A3D31]"
                            >
                              மாதிரி
                            </button>
                            <a
                              href={book.amazon_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-xs rounded bg-[#241F1A] hover:bg-[#FF9900] hover:text-[#111] text-white font-medium flex items-center gap-1"
                            >
                              <span>அமேசான்</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 2. MATCHED POEMS (If contentType !== 'books' and matchedPoems.length > 0) */}
            {contentType !== 'books' && matchedPoems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Feather className="w-5 h-5 text-[#8B5A2B]" />
                  <h3 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif">
                    கண்டறியப்பட்ட கவிதைகள் ({matchedPoems.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedPoems.map((poem) => (
                    <article
                      key={`poem-${poem.id}`}
                      onClick={() => onOpenPoemModal(poem)}
                      className="group bg-white rounded-xl border border-[#D5C7B5] hover:border-[#8B5A2B]/40 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#8A7969] mb-2">
                          <span className="font-semibold text-[#8B5A2B]">{poem.category}</span>
                          <span>{new Date(poem.created_at).toLocaleDateString('ta-IN')}</span>
                        </div>

                        <h4 className="text-lg font-serif font-bold text-[#1F1914] font-tamil-serif group-hover:text-[#8B5A2B] transition-colors leading-snug">
                          {poem.title}
                        </h4>

                        <p className="text-xs text-[#6B5C4F] mt-0.5">
                          ஆசிரியர்: <span className="font-semibold text-[#30261E]">{poem.author}</span>
                        </p>

                        <div className="mt-3 p-3 rounded-lg bg-[#FAF7F0] border border-[#EBE3D3] font-tamil-serif text-xs leading-relaxed text-[#332A22] whitespace-pre-line line-clamp-3">
                          {poem.content}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#EAE1D3] flex items-center justify-between text-xs text-[#7A6B5C]">
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

                        <button
                          type="button"
                          onClick={() => onOpenPoemModal(poem)}
                          className="flex items-center gap-1 font-semibold text-[#8B5A2B] group-hover:text-[#643E19]"
                        >
                          <span>முழு கவிதை வாசிக்க</span>
                          <BookOpen className="w-3 h-3" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
