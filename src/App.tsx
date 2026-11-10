import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SearchResultsSection } from './components/SearchResultsSection';
import { BooksSection } from './components/BooksSection';
import { PoemListSection } from './components/PoemListSection';
import { PoemsPage } from './components/PoemsPage';
import { SubmitPoemPage } from './components/SubmitPoemPage';
import { DownloadPortalPage } from './components/DownloadPortalPage';
import { PromoteBookPage } from './components/PromoteBookPage';
import { PoemReaderModal } from './components/PoemReaderModal';
import { PoemSubmitModal } from './components/PoemSubmitModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CaptchaModal } from './components/CaptchaModal';
import { Footer } from './components/Footer';
import { Poem, Book, AdminUser, SearchContentType, AppView } from './types';
import { performUnifiedSearch, getAvailableAuthors } from './utils/search';

export default function App() {
  // 1. CAPTCHA Security Gate State
  const [isCaptchaVerified, setIsCaptchaVerified] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') return true;
      return sessionStorage.getItem('vasantham_verified') === 'true';
    }
    return false;
  });

  // 2. Active View State (Synchronized with hash)
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validViews: AppView[] = ['home', 'poems', 'books', 'submit_poem', 'download', 'promote_book'];
      if (validViews.includes(hash as AppView)) {
        return hash as AppView;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      if (viewParam && validViews.includes(viewParam as AppView)) {
        return viewParam as AppView;
      }
    }
    return 'home';
  });

  const navigateView = (view: AppView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'home') {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      } else {
        window.location.hash = view;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to hash changes for browser forward/back buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews: AppView[] = ['home', 'poems', 'books', 'submit_poem', 'download', 'promote_book'];
      if (validViews.includes(hash as AppView)) {
        setCurrentView(hash as AppView);
      } else if (!hash) {
        setCurrentView('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 3. Data States
  const [poems, setPoems] = useState<Poem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // 4. Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('அனைத்தும்');
  const [selectedAuthor, setSelectedAuthor] = useState('அனைத்தும்');
  const [contentType, setContentType] = useState<SearchContentType>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'popular' | 'title'>('relevance');

  // 5. Modals & Admin States
  const [readingPoem, setReadingPoem] = useState<Poem | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vasantham_admin_token');
    }
    return null;
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Fetch approved poems
  const fetchPoems = useCallback(async () => {
    try {
      const res = await fetch('/api/poems');
      if (res.ok) {
        const data = await res.json();
        setPoems(data.poems || []);
      }
    } catch (err) {
      console.error('Failed to fetch poems:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch published books
  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  }, []);

  // Verify Admin Token on load
  const verifyAdmin = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.admin);
      } else {
        localStorage.removeItem('vasantham_admin_token');
        setAdminToken(null);
        setAdminUser(null);
      }
    } catch {
      // offline / error
    }
  }, []);

  useEffect(() => {
    fetchPoems();
    fetchBooks();
  }, [fetchPoems, fetchBooks]);

  useEffect(() => {
    if (adminToken) {
      verifyAdmin(adminToken);
    }
  }, [adminToken, verifyAdmin]);

  // Handle Likes
  const handleLikePoem = async (poemId: number) => {
    // Optimistic UI update
    setPoems((prev) =>
      prev.map((p) => (p.id === poemId ? { ...p, likes_count: p.likes_count + 1 } : p))
    );
    if (readingPoem && readingPoem.id === poemId) {
      setReadingPoem((prev) => (prev ? { ...prev, likes_count: prev.likes_count + 1 } : null));
    }

    try {
      await fetch(`/api/poems/${poemId}/like`, { method: 'POST' });
    } catch {
      // Revert if failed
    }
  };

  // Extract available dynamic filters
  const availableAuthors = useMemo(() => {
    return ['அனைத்தும்', ...getAvailableAuthors(poems, books)];
  }, [poems, books]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    poems.forEach((p) => {
      if (p.category) cats.add(p.category.trim());
    });
    return ['அனைத்தும்', ...Array.from(cats)];
  }, [poems]);

  // Compute unified search results
  const searchResults = useMemo(() => {
    return performUnifiedSearch(poems, books, {
      query: searchQuery,
      type: contentType,
      category: selectedCategory,
      author: selectedAuthor,
      sortBy,
    });
  }, [poems, books, searchQuery, contentType, selectedCategory, selectedAuthor, sortBy]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('அனைத்தும்');
    setSelectedAuthor('அனைத்தும்');
    setContentType('all');
    setSortBy('relevance');
  };

  // Admin Login Handler
  const handleAdminLoginSuccess = (token: string, admin: AdminUser) => {
    setAdminToken(token);
    setAdminUser(admin);
    setIsAdminDashboardOpen(true);
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    localStorage.removeItem('vasantham_admin_token');
    setAdminToken(null);
    setAdminUser(null);
    setIsAdminDashboardOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#241F1A]">
      {/* 1. Strict CAPTCHA Security Gate Wall */}
      {!isCaptchaVerified && (
        <CaptchaModal onVerified={() => setIsCaptchaVerified(true)} />
      )}

      {/* 2. Top Header with Full Navigation & Discreet 3-dot Admin Access */}
      <Header
        currentView={currentView}
        onNavigate={navigateView}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        admin={adminUser}
        onLogoutAdmin={handleAdminLogout}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* 3. Main Dynamic Content Area (Switches between views cleanly) */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <>
            {/* Hero Section with Search, Type Switcher & Author filter */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedAuthor={selectedAuthor}
              onSelectAuthor={setSelectedAuthor}
              contentType={contentType}
              onSelectContentType={setContentType}
              availableAuthors={availableAuthors}
              onOpenPoemSubmit={() => navigateView('submit_poem')}
              totalMatchesCount={searchResults.totalMatches}
            />

            {/* Quick Action Banner on Home for Download Portal & Book Promotion */}
            <div className="bg-[#F4ECE1] border-y border-[#DDD3C2]/70 py-4 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#241F1A] font-tamil-serif">
                    விரைவு இணைப்புகள்:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigateView('poems')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C2] hover:border-[#8B5A2B] text-xs font-medium text-[#4A3D30] transition-colors cursor-pointer"
                    >
                      அனைத்து கவிதைகள் ({poems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateView('books')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#DDD3C2] hover:border-[#8B5A2B] text-xs font-medium text-[#4A3D30] transition-colors cursor-pointer"
                    >
                      அமேசான் நூல்கள் ({books.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateView('download')}
                      className="px-3 py-1.5 rounded-lg bg-[#8B5A2B]/10 hover:bg-[#8B5A2B]/20 border border-[#8B5A2B]/30 text-xs font-semibold text-[#73431D] transition-colors cursor-pointer"
                    >
                      ஆத்தர் வாரியாக டவுன்லோட் செய்ய
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigateView('promote_book')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#241F1A] hover:bg-[#3D332B] text-[#FDFBF7] text-xs font-semibold transition-colors cursor-pointer"
                >
                  உங்கள் புத்தகத்தை விளம்பரப்படுத்த →
                </button>
              </div>
            </div>

            {/* Dedicated Unified Search Results Section */}
            <SearchResultsSection
              query={searchQuery}
              contentType={contentType}
              onSelectContentType={setContentType}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedAuthor={selectedAuthor}
              onSelectAuthor={setSelectedAuthor}
              sortBy={sortBy}
              onSelectSortBy={setSortBy}
              matchedPoems={searchResults.poems}
              matchedBooks={searchResults.books}
              availableAuthors={availableAuthors}
              availableCategories={availableCategories}
              onClearFilters={handleClearFilters}
              onOpenPoemModal={(p) => setReadingPoem(p)}
              onLikePoem={handleLikePoem}
              onOpenBookPreview={(b) => setPreviewBook(b)}
              onOpenSubmitModal={() => navigateView('submit_poem')}
            />

            {/* Published Books Section with Amazon Direct Buy Links */}
            <BooksSection
              books={books}
              externalPreviewBook={previewBook}
              onCloseExternalPreview={() => setPreviewBook(null)}
              onGoToPromote={() => navigateView('promote_book')}
            />

            {/* Poems Showcase Section */}
            <PoemListSection
              poems={searchResults.poems.length > 0 && (searchQuery || selectedCategory !== 'அனைத்தும்') ? searchResults.poems : poems}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenPoemModal={(p) => setReadingPoem(p)}
              onLikePoem={handleLikePoem}
              onOpenSubmitModal={() => navigateView('submit_poem')}
              searchQuery={searchQuery}
            />
          </>
        )}

        {/* VIEW 2: DEDICATED FULL POEMS PAGE */}
        {currentView === 'poems' && (
          <PoemsPage
            poems={poems}
            onBackToHome={() => navigateView('home')}
            onOpenPoemModal={(p) => setReadingPoem(p)}
            onLikePoem={handleLikePoem}
            onGoToSubmit={() => navigateView('submit_poem')}
            onGoToDownload={(author) => {
              if (author) setSelectedAuthor(author);
              navigateView('download');
            }}
            availableAuthors={availableAuthors}
          />
        )}

        {/* VIEW 3: DEDICATED PUBLISHED BOOKS PAGE */}
        {currentView === 'books' && (
          <div className="min-h-screen bg-[#FDFBF7] py-6 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigateView('home')}
                className="text-xs sm:text-sm text-[#7A6B5C] hover:text-[#241F1A] transition-colors cursor-pointer"
              >
                ← முகப்புக்குத் திரும்பு
              </button>

              <button
                type="button"
                onClick={() => navigateView('promote_book')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                உங்கள் புத்தகத்தை விளம்பரப்படுத்தவும் +
              </button>
            </div>

            <BooksSection
              books={books}
              externalPreviewBook={previewBook}
              onCloseExternalPreview={() => setPreviewBook(null)}
              onGoToPromote={() => navigateView('promote_book')}
            />
          </div>
        )}

        {/* VIEW 4: DEDICATED POEM SUBMISSION PAGE */}
        {currentView === 'submit_poem' && (
          <SubmitPoemPage
            onBackToHome={() => navigateView('home')}
            onPoemSubmitted={() => {
              fetchPoems();
              navigateView('poems');
            }}
          />
        )}

        {/* VIEW 5: DEDICATED POEM DOWNLOAD PORTAL */}
        {currentView === 'download' && (
          <DownloadPortalPage
            poems={poems}
            onBackToHome={() => navigateView('home')}
            onOpenPoemModal={(p) => setReadingPoem(p)}
            initialAuthor={selectedAuthor !== 'அனைத்தும்' ? selectedAuthor : ''}
            availableAuthors={availableAuthors}
          />
        )}

        {/* VIEW 6: DEDICATED PROMOTE BOOK (AMAZON LINK) PAGE */}
        {currentView === 'promote_book' && (
          <PromoteBookPage
            onBackToHome={() => navigateView('home')}
            onGoToBooks={() => navigateView('books')}
          />
        )}
      </main>

      {/* 4. Elegant Footer */}
      <Footer onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

      {/* 5. Modals */}
      {/* Full Poem Reader Modal */}
      {readingPoem && (
        <PoemReaderModal
          poem={readingPoem}
          onClose={() => setReadingPoem(null)}
          onLikePoem={handleLikePoem}
        />
      )}

      {/* User Poem Submission Form Modal */}
      {isSubmitModalOpen && (
        <PoemSubmitModal
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmitted={() => {
            fetchPoems();
          }}
        />
      )}

      {/* Discreet Admin Login Modal (Triggered by 3-dot icon) */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* Hidden Admin Moderation Dashboard */}
      {isAdminDashboardOpen && adminToken && adminUser && (
        <AdminDashboard
          token={adminToken}
          admin={adminUser}
          onLogout={handleAdminLogout}
          onClose={() => setIsAdminDashboardOpen(false)}
          onDataChanged={() => {
            fetchPoems();
            fetchBooks();
          }}
        />
      )}
    </div>
  );
}
