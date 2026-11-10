import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCw,
  PlusCircle,
  BookPlus,
  LogOut,
  X,
  FileCheck,
  ListFilter,
  Eye,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Poem, Book, AdminStats, AdminUser } from '../types';

interface AdminDashboardProps {
  token: string;
  admin: AdminUser;
  onLogout: () => void;
  onClose: () => void;
  onDataChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  admin,
  onLogout,
  onClose,
  onDataChanged,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingPoems, setPendingPoems] = useState<Poem[]>([]);
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [allPoems, setAllPoems] = useState<Poem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'pending_books' | 'all' | 'create_poem' | 'create_book'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Poem Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('இயற்கை');
  const [newContent, setNewContent] = useState('');

  // New Book Form State
  const [bookTitle, setBookTitle] = useState('');
  const [bookTamilTitle, setBookTamilTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [bookAmazon, setBookAmazon] = useState('https://www.amazon.in');
  const [bookYear, setBookYear] = useState('2026');
  const [bookPrice, setBookPrice] = useState('250');
  const [bookPages, setBookPages] = useState('160');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch Pending Poems
      const pendingRes = await fetch('/api/admin/pending-poems', { headers });
      if (pendingRes.ok) {
        const pData = await pendingRes.json();
        setPendingPoems(pData.poems || []);
      }

      // 3. Fetch Pending Promoted Books
      const pendingBooksRes = await fetch('/api/admin/pending-books', { headers });
      if (pendingBooksRes.ok) {
        const pbData = await pendingBooksRes.json();
        setPendingBooks(pbData.books || []);
      }

      // 4. Fetch All Poems
      const allRes = await fetch('/api/admin/all-poems', { headers });
      if (allRes.ok) {
        const aData = await allRes.json();
        setAllPoems(aData.poems || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show temporary action toast
  const showFeedback = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // 1. Moderate: Approve Poem
  const handleApprovePoem = async (poemId: number) => {
    try {
      const res = await fetch(`/api/admin/poems/${poemId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'கவிதை நேரலையில் வெளியிடப்பட்டது!');
        fetchDashboardData();
        onDataChanged();
      }
    } catch {
      showFeedback('ஒப்புதல் அளிப்பதில் பிழை ஏற்பட்டது.');
    }
  };

  // 2. Moderate: Reject Poem
  const handleRejectPoem = async (poemId: number) => {
    try {
      const res = await fetch(`/api/admin/poems/${poemId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'கவிதை நிராகரிக்கப்பட்டது.');
        fetchDashboardData();
        onDataChanged();
      }
    } catch {
      showFeedback('நிராகரிப்பதில் பிழை ஏற்பட்டது.');
    }
  };

  // 3. Moderate: Delete Poem Permanently
  const handleDeletePoem = async (poemId: number) => {
    if (!confirm('இந்த கவிதையை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?')) return;
    try {
      const res = await fetch(`/api/admin/poems/${poemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'கவிதை நீக்கப்பட்டது.');
        fetchDashboardData();
        onDataChanged();
      }
    } catch {
      showFeedback('நீக்குவதில் பிழை ஏற்பட்டது.');
    }
  };

  // 3.1 Moderate: Approve Book
  const handleApproveBook = async (bookId: number) => {
    try {
      const res = await fetch(`/api/admin/books/${bookId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'புத்தகம் அங்கீகரிக்கப்பட்டு நேரலையில் விளம்பரப்படுத்தப்பட்டது!');
        fetchDashboardData();
        onDataChanged();
      }
    } catch {
      showFeedback('புத்தகத்தை அங்கீகரிப்பதில் பிழை ஏற்பட்டது.');
    }
  };

  // 3.2 Moderate: Reject Book
  const handleRejectBook = async (bookId: number) => {
    try {
      const res = await fetch(`/api/admin/books/${bookId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'புத்தகம் நிராகரிக்கப்பட்டது.');
        fetchDashboardData();
        onDataChanged();
      }
    } catch {
      showFeedback('நிராகரிப்பதில் பிழை ஏற்பட்டது.');
    }
  };

  // 3.3 Moderate: Delete Book Permanently
  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('இந்த புத்தகத்தை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?')) return;
    try {
      const res = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'புத்தகம் நீக்கப்பட்டது.');
        fetchDashboardData();
        onDataChanged();
      }
    } catch {
      showFeedback('நூலை நீக்குவதில் பிழை ஏற்பட்டது.');
    }
  };

  // 4. Admin Create Direct Poem
  const handleCreatePoem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/admin/poems/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          author: newAuthor.trim(),
          category: newCategory,
          content: newContent.trim(),
        }),
      });

      if (res.ok) {
        showFeedback('புதிய கவிதை நேரடியாக வெளியிடப்பட்டது!');
        setNewTitle('');
        setNewAuthor('');
        setNewContent('');
        fetchDashboardData();
        onDataChanged();
        setActiveTab('all');
      }
    } catch {
      showFeedback('கவிதையை உருவாக்க இயலவில்லை.');
    }
  };

  // 5. Admin Add Book
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookTamilTitle.trim() || !bookAuthor.trim()) return;

    try {
      const res = await fetch('/api/admin/books/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle.trim(),
          tamil_title: bookTamilTitle.trim(),
          author: bookAuthor.trim(),
          description: bookDesc.trim(),
          cover_url: '/src/assets/images/book_cover_kanavugal_1794242034346.jpg',
          amazon_url: bookAmazon.trim(),
          publication_year: parseInt(bookYear, 10) || 2026,
          price_inr: parseInt(bookPrice, 10) || 250,
          pages: parseInt(bookPages, 10) || 160,
        }),
      });

      if (res.ok) {
        showFeedback('புதிய நூல் வெற்றிகரமாக சேர்க்கப்பட்டது!');
        setBookTitle('');
        setBookTamilTitle('');
        setBookAuthor('');
        setBookDesc('');
        fetchDashboardData();
        onDataChanged();
      }
    } catch {
      showFeedback('நூலை சேர்க்க இயலவில்லை.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#120E0A]/85 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[94vh] rounded-2xl bg-[#FCFAF6] border border-[#443426]/20 shadow-2xl flex flex-col text-[#241F1A] overflow-hidden">
        {/* Dashboard Top Header */}
        <div className="p-4 sm:p-6 bg-[#241F1A] text-[#FDFBF7] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5A2B]/40 flex items-center justify-center text-[#E0B888] border border-[#E0B888]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#FDFBF7] font-tamil-serif">
                  நிர்வாகி கட்டுப்பாட்டு பலகை
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#8B5A2B] text-white px-2 py-0.5 rounded font-semibold">
                  JWT Protected
                </span>
              </div>
              <p className="text-xs text-[#CBBBA8]">
                Logged in as <span className="text-[#E0B888] font-semibold">{admin.username}</span> • Moderation & Books Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#E0B888] transition-colors"
              title="புதுப்பி (Refresh)"
              aria-label="Refresh"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-200 text-xs font-medium transition-colors border border-red-800/40 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">வெளியேறு</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toast Alert */}
        {actionMessage && (
          <div className="p-3 bg-emerald-700 text-white text-xs sm:text-sm font-medium flex items-center justify-between px-6 shadow-sm">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Stats Row */}
        <div className="p-4 sm:p-6 bg-[#F6F0E6] border-b border-[#EAE2D4] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-xl border border-[#DDD3C2] text-center shadow-2xs">
            <span className="text-[11px] text-[#7A6B5C] uppercase block">நிலுவையில் (Pending)</span>
            <span className="text-2xl font-bold font-mono text-[#C85A32]">
              {stats?.pendingPoems ?? 0}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#DDD3C2] text-center shadow-2xs">
            <span className="text-[11px] text-[#7A6B5C] uppercase block">நேரலையில் (Live)</span>
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {stats?.approvedPoems ?? 0}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#DDD3C2] text-center shadow-2xs">
            <span className="text-[11px] text-[#7A6B5C] uppercase block">நிராகரிப்பு (Rejected)</span>
            <span className="text-2xl font-bold font-mono text-stone-600">
              {stats?.rejectedPoems ?? 0}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#DDD3C2] text-center shadow-2xs">
            <span className="text-[11px] text-[#7A6B5C] uppercase block">மொத்த கவிதைகள்</span>
            <span className="text-2xl font-bold font-mono text-[#241F1A]">
              {stats?.totalPoems ?? 0}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#DDD3C2] text-center shadow-2xs">
            <span className="text-[11px] text-[#7A6B5C] uppercase block">நூல்கள் (Books)</span>
            <span className="text-2xl font-bold font-mono text-[#8B5A2B]">
              {stats?.totalBooks ?? 0}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#DDD3C2] text-center shadow-2xs">
            <span className="text-[11px] text-[#7A6B5C] uppercase block">பார்வைகள் (Reads)</span>
            <span className="text-2xl font-bold font-mono text-[#241F1A]">
              {stats?.totalReads ?? 0}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-4 sm:px-6 pt-3 bg-[#FCFAF6] border-b border-[#EAE2D4] flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pending'
                ? 'border-[#8B5A2B] text-[#8B5A2B] font-bold'
                : 'border-transparent text-[#6C5D4F] hover:text-[#241F1A]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>நிலுவையில் உள்ள கவிதைகள்</span>
            {pendingPoems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[#C85A32] text-white text-[10px] font-bold">
                {pendingPoems.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending_books')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pending_books'
                ? 'border-[#8B5A2B] text-[#8B5A2B] font-bold'
                : 'border-transparent text-[#6C5D4F] hover:text-[#241F1A]'
            }`}
          >
            <BookPlus className="w-4 h-4" />
            <span>நிலுவை நூல்கள் (Book Requests)</span>
            {pendingBooks.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[#8B5A2B] text-white text-[10px] font-bold">
                {pendingBooks.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'border-[#8B5A2B] text-[#8B5A2B] font-bold'
                : 'border-transparent text-[#6C5D4F] hover:text-[#241F1A]'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>அனைத்து கவிதைகள் ({allPoems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create_poem')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'create_poem'
                ? 'border-[#8B5A2B] text-[#8B5A2B] font-bold'
                : 'border-transparent text-[#6C5D4F] hover:text-[#241F1A]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>புதிய கவிதை வெளியிட</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create_book')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'create_book'
                ? 'border-[#8B5A2B] text-[#8B5A2B] font-bold'
                : 'border-transparent text-[#6C5D4F] hover:text-[#241F1A]'
            }`}
          >
            <BookPlus className="w-4 h-4" />
            <span>புதிய நூல் சேர்க்க</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FDFBF7]">
          {/* TAB 1: PENDING POEMS MODERATION */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#241F1A] font-tamil-serif">
                  ஆய்வு செய்யப்பட வேண்டிய கவிதைகள் (Pending Moderation Queue)
                </h3>
                <span className="text-xs text-[#7A6B5C]">
                  {pendingPoems.length} கவிதைகள் காத்திருக்கின்றன
                </span>
              </div>

              {pendingPoems.length === 0 ? (
                <div className="p-12 text-center bg-[#F8F4EC] rounded-2xl border border-[#E9DFCF] max-w-md mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-[#241F1A] font-tamil-serif">
                    நிலுவையில் கவிதைகள் எதுவும் இல்லை!
                  </h4>
                  <p className="text-xs text-[#7A6B5C] mt-1">
                    அனைத்து பயனர் சமர்ப்பிப்புகளும் ஆய்வு செய்யப்பட்டுவிட்டன.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {pendingPoems.map((poem) => (
                    <div
                      key={poem.id}
                      className="p-5 sm:p-6 bg-white rounded-2xl border border-[#DDD3C2] shadow-xs hover:border-[#8B5A2B]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-xs text-[#8A7969]">
                            <span className="font-semibold text-[#8B5A2B]">{poem.category}</span>
                            <span>·</span>
                            <span>சமர்ப்பிக்கப்பட்ட நாள்: {new Date(poem.created_at).toLocaleString('ta-IN')}</span>
                            {poem.contact_email && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-[11px] text-[#555]">{poem.contact_email}</span>
                              </>
                            )}
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            நிலுவையில் (Pending)
                          </span>
                        </div>

                        <h4 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif">
                          {poem.title}
                        </h4>
                        <p className="text-xs text-[#6C5D4F] mt-0.5 font-tamil-sans">
                          ஆசிரியர்: <span className="font-semibold text-[#241F1A]">{poem.author}</span>
                        </p>

                        <div className="mt-4 p-4 rounded-xl bg-[#FDFBF7] border border-[#EAE2D4] font-tamil-serif text-sm leading-relaxed text-[#2C231B] whitespace-pre-line">
                          {poem.content}
                        </div>
                      </div>

                      {/* Moderation Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-[#EAE2D4] flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-[#8A7969] italic">
                          இந்த கவிதையை உடனே நேரலையில் வெளியிடலாம் அல்லது நிராகரிக்கலாம்.
                        </span>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleDeletePoem(poem.id)}
                            className="p-2 rounded-xl text-[#7A6B5C] hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            title="நிரந்தரமாக நீக்கு (Delete Permanently)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectPoem(poem.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>நிராகரி (Reject)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApprovePoem(poem.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ஒப்புதல் அளி (Approve Live)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1.5: PENDING BOOKS PROMOTION MODERATION */}
          {activeTab === 'pending_books' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#241F1A] font-tamil-serif">
                  விளம்பர ஒப்புதல் காத்திருக்கும் நூல்கள் (Pending Books Queue)
                </h3>
                <span className="text-xs text-[#7A6B5C]">
                  {pendingBooks.length} நூல்கள் ஆய்வுக்காக காத்திருக்கின்றன
                </span>
              </div>

              {pendingBooks.length === 0 ? (
                <div className="p-12 text-center bg-[#F8F4EC] rounded-2xl border border-[#E9DFCF] max-w-md mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-[#241F1A] font-tamil-serif">
                    நிலுவையில் நூல்கள் எதுவும் இல்லை!
                  </h4>
                  <p className="text-xs text-[#7A6B5C] mt-1">
                    எழுத்தாளர்கள் சமர்ப்பித்த அனைத்து விளம்பர நூல்களும் ஆய்வு செய்யப்பட்டுவிட்டன.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {pendingBooks.map((book) => (
                    <div
                      key={book.id}
                      className="p-5 sm:p-6 bg-white rounded-2xl border border-[#DDD3C2] shadow-xs hover:border-[#8B5A2B]/40 transition-all flex flex-col justify-between"
                    >
                      <div className="flex flex-col sm:flex-row gap-5">
                        {/* Cover Image */}
                        <div className="w-24 sm:w-28 shrink-0">
                          <img
                            src={book.cover_url || '/src/assets/images/book_cover_kanavugal_1794242034346.jpg'}
                            alt={book.tamil_title}
                            className="w-full aspect-[2/3] object-cover rounded-lg shadow-sm border border-[#DDD3C2]"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs text-[#8A7969]">
                              ஆண்டு: <strong className="text-[#241F1A]">{book.publication_year}</strong> · விலை: <strong className="text-[#8B5A2B]">₹{book.price_inr}</strong>
                              {book.contact_email && ` · ${book.contact_email}`}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              ஒப்புதல் நிலுவை (Pending)
                            </span>
                          </div>

                          <h4 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif">
                            {book.tamil_title}
                          </h4>
                          <p className="text-xs text-[#7A6B5C] italic">
                            {book.title}
                          </p>
                          <p className="text-xs text-[#6C5D4F] mt-1 font-tamil-sans">
                            ஆசிரியர்: <span className="font-semibold text-[#241F1A]">{book.author}</span>
                          </p>

                          {book.description && (
                            <p className="mt-3 text-xs text-[#4A3D30] font-tamil-sans line-clamp-3 leading-relaxed bg-[#FDFBF7] p-3 rounded-lg border border-[#EAE2D4]">
                              {book.description}
                            </p>
                          )}

                          {/* Amazon Link Badge */}
                          <div className="mt-3 flex items-center gap-2">
                            <a
                              href={book.amazon_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9900]/15 text-[#B36B00] hover:bg-[#FF9900]/25 text-xs font-medium border border-[#FF9900]/30 transition-colors"
                            >
                              <span>அமேசான் இணைப்பு பார்க்க (Test Link)</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <span className="text-[11px] text-[#7A6B5C] font-mono truncate max-w-xs">
                              {book.amazon_url}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Moderation Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-[#EAE2D4] flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-[#8A7969] italic">
                          ஒப்புதல் அளித்தவுடன் வாசகர்களின் புத்தகங்கள் பக்கத்தில் நேரடியாகக் காட்சிப்படுத்தப்படும்.
                        </span>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 rounded-xl text-[#7A6B5C] hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            title="நிரந்தரமாக நீக்கு"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectBook(book.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>நிராகரி (Reject)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveBook(book.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ஒப்புதல் அளித்து வெளியிடு (Approve & Live)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALL POEMS LIST */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#241F1A] font-tamil-serif">
                  அனைத்து கவிதைகள் (All Poems Database)
                </h3>
                <span className="text-xs text-[#7A6B5C]">
                  மொத்தம்: {allPoems.length}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#DDD3C2] bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F4ECE1] text-[#4A3D30] font-semibold">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">தலைப்பு</th>
                      <th className="p-3">ஆசிரியர்</th>
                      <th className="p-3">வகை</th>
                      <th className="p-3">நிலை (Status)</th>
                      <th className="p-3">விருப்பம் / பார்வை</th>
                      <th className="p-3 text-right">செயல்கள்</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE2D4]">
                    {allPoems.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FDFBF7]">
                        <td className="p-3 font-mono text-xs">{p.id}</td>
                        <td className="p-3 font-semibold font-tamil-serif text-[#241F1A]">{p.title}</td>
                        <td className="p-3">{p.author}</td>
                        <td className="p-3">{p.category}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              p.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.status === 'approved' ? 'நேரலை' : p.status === 'pending' ? 'நிலுவை' : 'நிராகரிக்கப்பட்டது'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs">
                          {p.likes_count} ❤ · {p.reads_count} 👁
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {p.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleApprovePoem(p.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs"
                              title="Approve"
                            >
                              ஒப்புதல்
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeletePoem(p.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT POEM PUBLICATION */}
          {activeTab === 'create_poem' && (
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD3C2] shadow-xs">
              <h3 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif mb-2">
                நிர்வாகியின் நேரடி கவிதை வெளியீடு
              </h3>
              <p className="text-xs text-[#7A6B5C] mb-6">
                இங்கே சமர்ப்பிக்கப்படும் கவிதை ஒப்புதல் காத்திருப்பு இன்றி உடனடியாக வாசகர் பக்கத்தில் நேரலையாக வெளியிடப்படும்.
              </p>

              <form onSubmit={handleCreatePoem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                    கவிதை தலைப்பு *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="உதாரணம்: மார்கழி பனித்துளி"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white outline-none focus:ring-2 focus:ring-[#8B5A2B]/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      ஆசிரியர் பெயர் *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="உதாரணம்: வசந்தகுமார்"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white outline-none focus:ring-2 focus:ring-[#8B5A2B]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      வகை *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white outline-none focus:ring-2 focus:ring-[#8B5A2B]/30"
                    >
                      <option value="இயற்கை">இயற்கை</option>
                      <option value="காதல்">காதல்</option>
                      <option value="வாழ்க்கை">வாழ்க்கை</option>
                      <option value="தத்துவம்">தத்துவம்</option>
                      <option value="தமிழ் பெருமை">தமிழ் பெருமை</option>
                      <option value="சமூகம்">சமூகம்</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                    கவிதை வரிகள் *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="கவிதை வரிகளை உள்ளிடவும்..."
                    className="w-full p-3.5 text-sm sm:text-base font-tamil-serif rounded-xl border border-[#D5C7B5] bg-white outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#241F1A] hover:bg-[#3D332B] text-[#FDFBF7] text-sm font-semibold transition-colors shadow-sm"
                >
                  நேரடியாக வெளியிட (Publish Live Immediately)
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ADD PUBLISHED BOOK */}
          {activeTab === 'create_book' && (
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD3C2] shadow-xs">
              <h3 className="text-xl font-serif font-bold text-[#1F1914] font-tamil-serif mb-2">
                புதிய வெளியிடப்பட்ட நூல் சேர்க்க
              </h3>
              <p className="text-xs text-[#7A6B5C] mb-6">
                அமேசான் தயாரிப்பு பக்கத்திற்கான நேரடி இணைப்புடன் கூடிய புதிய கவிதை நூலை தளத்தில் காட்சிப்படுத்துங்கள்.
              </p>

              <form onSubmit={handleCreateBook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      நூல் தலைப்பு (தமிழ்) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookTamilTitle}
                      onChange={(e) => setBookTamilTitle(e.target.value)}
                      placeholder="உதாரணம்: விடியலின் ராகங்கள்"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      ஆங்கிலத் தலைப்பு (English Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. Melodies of Dawn"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      ஆசிரியர் பெயர் *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      placeholder="உதாரணம்: கவிஞர் வசந்தன்"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      அமேசான் இணைப்பு (Amazon URL) *
                    </label>
                    <input
                      type="url"
                      required
                      value={bookAmazon}
                      onChange={(e) => setBookAmazon(e.target.value)}
                      placeholder="https://www.amazon.in/dp/..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D5C7B5] bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                    நூல் விளக்கம் (Description)
                  </label>
                  <textarea
                    rows={3}
                    value={bookDesc}
                    onChange={(e) => setBookDesc(e.target.value)}
                    placeholder="நூலின் சாராம்சம் மற்றும் சிறப்பம்சங்கள்..."
                    className="w-full p-3 text-sm rounded-xl border border-[#D5C7B5] bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      ஆண்டு
                    </label>
                    <input
                      type="number"
                      value={bookYear}
                      onChange={(e) => setBookYear(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5C7B5] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      விலை (₹)
                    </label>
                    <input
                      type="number"
                      value={bookPrice}
                      onChange={(e) => setBookPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5C7B5] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3D30] mb-1">
                      பக்கங்கள்
                    </label>
                    <input
                      type="number"
                      value={bookPages}
                      onChange={(e) => setBookPages(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5C7B5] bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#241F1A] hover:bg-[#3D332B] text-[#FDFBF7] text-sm font-semibold transition-colors shadow-sm"
                >
                  நூலை அமேசான் இணைப்புடன் சேர்க்க
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
