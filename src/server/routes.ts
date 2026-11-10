import { Router } from 'express';
import { db } from './db';
import {
  generateCaptchaChallenge,
  verifyCaptchaSolution,
  sanitizeHtml,
  cleanPoetryText,
} from './security';
import {
  verifyAdminCredentials,
  generateAdminToken,
  requireAdminAuth,
} from './auth';

export const apiRouter = Router();

// ==========================================
// 1. CAPTCHA SECURITY WALL ENDPOINTS
// ==========================================

apiRouter.get('/captcha/new', (req, res) => {
  const challenge = generateCaptchaChallenge();
  res.json(challenge);
});

apiRouter.post('/captcha/verify', (req, res) => {
  const { token, answer } = req.body;
  if (!token || !answer) {
    return res.status(400).json({ error: 'டோக்கன் மற்றும் விடை தேவை (Token and answer required)' });
  }

  const isValid = verifyCaptchaSolution(token, String(answer));
  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'தவறான விடை அல்லது காலாவதியான குறியீடு. மீண்டும் முயற்சிக்கவும். (Incorrect or expired CAPTCHA)',
    });
  }

  // Issue verified session ticket
  const verifiedTicket = `vst_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  res.json({
    success: true,
    message: 'சரிபார்ப்பு வெற்றிகரமானது (CAPTCHA verification successful)',
    verifiedTicket,
  });
});

// ==========================================
// 2. PUBLIC POEMS ENDPOINTS
// ==========================================

// Get all approved poems
apiRouter.get('/poems', (req, res) => {
  try {
    const { category, q } = req.query;
    let query = `
      SELECT id, title, author, content, category, likes_count, reads_count, downloads_count, created_at
      FROM poems
      WHERE status = 'approved'
    `;
    const params: any[] = [];

    if (category && category !== 'அனைத்தும்' && category !== 'all') {
      query += ` AND category = ?`;
      params.push(String(category));
    }

    if (q && typeof q === 'string' && q.trim()) {
      query += ` AND (title LIKE ? OR author LIKE ? OR content LIKE ?)`;
      const searchParam = `%${q.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY created_at DESC`;

    const poems = db.prepare(query).all(...params);
    res.json({ poems });
  } catch (err: any) {
    console.error('Error fetching poems:', err);
    res.status(500).json({ error: 'கவிதைகளைப் பெறுவதில் பிழை ஏற்பட்டது' });
  }
});

// Get single poem by id and increment reads
apiRouter.get('/poems/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'தவறான எண்' });

    db.prepare('UPDATE poems SET reads_count = reads_count + 1 WHERE id = ?').run(id);

    const poem = db.prepare(`
      SELECT id, title, author, content, category, status, likes_count, reads_count, downloads_count, created_at
      FROM poems
      WHERE id = ?
    `).get(id);

    if (!poem) {
      return res.status(404).json({ error: 'கவிதை கிடைக்கவில்லை' });
    }

    res.json({ poem });
  } catch (err: any) {
    res.status(500).json({ error: 'சேவையகப் பிழை' });
  }
});

// Like a poem
apiRouter.post('/poems/:id/like', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'தவறான எண்' });

    db.prepare('UPDATE poems SET likes_count = likes_count + 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT likes_count FROM poems WHERE id = ?').get(id) as { likes_count: number };
    res.json({ success: true, likes_count: updated?.likes_count || 0 });
  } catch (err) {
    res.status(500).json({ error: 'விருப்பத்தை பதிவு செய்ய இயலவில்லை' });
  }
});

// Record download count
apiRouter.post('/poems/:id/download', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'தவறான எண்' });

    db.prepare('UPDATE poems SET downloads_count = downloads_count + 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'பதிவிறக்கம் பதிவு செய்ய இயலவில்லை' });
  }
});

// User poem submission ("உங்கள் கவிதை எழுதுங்கள்")
// Strict validation and sanitization. Status is set to 'pending' by default.
apiRouter.post('/poems/submit', (req, res) => {
  try {
    const { title, author, content, category, email } = req.body;

    if (!title || !author || !content) {
      return res.status(400).json({
        error: 'தலைப்பு, ஆசிரியர் பெயர் மற்றும் கவிதை வரிகள் அவசியமானவை (Title, Author, Content required)',
      });
    }

    const cleanTitle = cleanPoetryText(sanitizeHtml(title)).substring(0, 150);
    const cleanAuthor = cleanPoetryText(sanitizeHtml(author)).substring(0, 100);
    const cleanContent = cleanPoetryText(content).substring(0, 5000);
    const cleanCategory = (category ? cleanPoetryText(sanitizeHtml(category)) : 'இயற்கை').substring(0, 50);
    const cleanEmail = email ? cleanPoetryText(sanitizeHtml(email)).substring(0, 100) : null;

    if (cleanTitle.length < 2 || cleanAuthor.length < 2 || cleanContent.length < 10) {
      return res.status(400).json({
        error: 'கவிதை விவரங்கள் மிகவும் குறைவாக உள்ளன. முழுமையாக உள்ளிடவும்.',
      });
    }

    const stmt = db.prepare(`
      INSERT INTO poems (title, author, content, category, status, contact_email)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `);

    const result = stmt.run(cleanTitle, cleanAuthor, cleanContent, cleanCategory, cleanEmail);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'உங்கள் கவிதை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! நிர்வாகியின் ஆய்வுக்குப் பிறகு விரைவில் வெளியிடப்படும்.',
    });
  } catch (err: any) {
    console.error('Poem submission error:', err);
    res.status(500).json({ error: 'கவிதையை சமர்ப்பிப்பதில் பிழை ஏற்பட்டது.' });
  }
});

// ==========================================
// 3. PUBLISHED BOOKS ENDPOINTS
// ==========================================

apiRouter.get('/books', (req, res) => {
  try {
    const { q, author } = req.query;
    let query = `
      SELECT id, title, tamil_title, author, description, cover_url, amazon_url, publication_year, isbn, pages, price_inr, featured
      FROM books
      WHERE (status = 'approved' OR status IS NULL)
    `;
    const params: any[] = [];

    if (author && author !== 'அனைத்தும்' && author !== 'all') {
      query += ` AND author LIKE ?`;
      params.push(`%${String(author).trim()}%`);
    }

    if (q && typeof q === 'string' && q.trim()) {
      query += ` AND (title LIKE ? OR tamil_title LIKE ? OR author LIKE ? OR description LIKE ? OR isbn LIKE ?)`;
      const searchParam = `%${q.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY featured DESC, publication_year DESC`;

    const books = db.prepare(query).all(...params);
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: 'நூல்களைப் பெறுவதில் பிழை' });
  }
});

// ==========================================
// 3.1. UNIFIED ROBUST SEARCH & METADATA ENDPOINT
// ==========================================

apiRouter.get('/search', (req, res) => {
  try {
    const { q = '', type = 'all', category = 'அனைத்தும்', author = 'அனைத்தும்', sortBy = 'relevance' } = req.query;
    const queryStr = typeof q === 'string' ? q.trim() : '';
    const contentType = typeof type === 'string' ? type : 'all';
    const categoryStr = typeof category === 'string' ? category : 'அனைத்தும்';
    const authorStr = typeof author === 'string' ? author : 'அனைத்தும்';

    let matchedPoems: any[] = [];
    let matchedBooks: any[] = [];

    // 1. Search Poems (if type is 'all' or 'poems')
    if (contentType !== 'books') {
      let poemQuery = `
        SELECT id, title, author, content, category, likes_count, reads_count, downloads_count, created_at
        FROM poems
        WHERE status = 'approved'
      `;
      const poemParams: any[] = [];

      if (categoryStr && categoryStr !== 'அனைத்தும்' && categoryStr !== 'all') {
        poemQuery += ` AND category = ?`;
        poemParams.push(categoryStr);
      }

      if (authorStr && authorStr !== 'அனைத்தும்' && authorStr !== 'all') {
        poemQuery += ` AND author LIKE ?`;
        poemParams.push(`%${authorStr}%`);
      }

      if (queryStr) {
        poemQuery += ` AND (title LIKE ? OR author LIKE ? OR content LIKE ? OR category LIKE ?)`;
        const p = `%${queryStr}%`;
        poemParams.push(p, p, p, p);
      }

      if (sortBy === 'popular') {
        poemQuery += ` ORDER BY (likes_count + reads_count) DESC`;
      } else if (sortBy === 'title') {
        poemQuery += ` ORDER BY title ASC`;
      } else {
        poemQuery += ` ORDER BY created_at DESC`;
      }

      matchedPoems = db.prepare(poemQuery).all(...poemParams);
    }

    // 2. Search Books (if type is 'all' or 'books')
    if (contentType !== 'poems') {
      let bookQuery = `
        SELECT id, title, tamil_title, author, description, cover_url, amazon_url, publication_year, isbn, pages, price_inr, featured
        FROM books
        WHERE (status = 'approved' OR status IS NULL)
      `;
      const bookParams: any[] = [];

      if (authorStr && authorStr !== 'அனைத்தும்' && authorStr !== 'all') {
        bookQuery += ` AND author LIKE ?`;
        bookParams.push(`%${authorStr}%`);
      }

      if (queryStr) {
        bookQuery += ` AND (title LIKE ? OR tamil_title LIKE ? OR author LIKE ? OR description LIKE ? OR isbn LIKE ?)`;
        const p = `%${queryStr}%`;
        bookParams.push(p, p, p, p, p);
      }

      if (sortBy === 'title') {
        bookQuery += ` ORDER BY tamil_title ASC`;
      } else {
        bookQuery += ` ORDER BY featured DESC, publication_year DESC`;
      }

      matchedBooks = db.prepare(bookQuery).all(...bookParams);
    }

    // Fetch dynamic metadata (available categories & authors)
    const distinctCategories = (db.prepare(`
      SELECT DISTINCT category FROM poems WHERE status = 'approved' AND category IS NOT NULL
    `).all() as { category: string }[]).map((r) => r.category);

    const poemAuthors = (db.prepare(`
      SELECT DISTINCT author FROM poems WHERE status = 'approved' AND author IS NOT NULL
    `).all() as { author: string }[]).map((r) => r.author);

    const bookAuthors = (db.prepare(`
      SELECT DISTINCT author FROM books WHERE author IS NOT NULL
    `).all() as { author: string }[]).map((r) => r.author);

    const distinctAuthors = Array.from(new Set([...poemAuthors, ...bookAuthors])).sort((a, b) =>
      a.localeCompare(b, 'ta')
    );

    res.json({
      query: queryStr,
      contentType,
      totalMatches: matchedPoems.length + matchedBooks.length,
      poemMatchesCount: matchedPoems.length,
      bookMatchesCount: matchedBooks.length,
      poems: matchedPoems,
      books: matchedBooks,
      filters: {
        categories: ['அனைத்தும்', ...distinctCategories],
        authors: ['அனைத்தும்', ...distinctAuthors],
      },
    });
  } catch (err: any) {
    console.error('Unified search error:', err);
    res.status(500).json({ error: 'தேடலில் பிழை ஏற்பட்டது' });
  }
});

apiRouter.get('/meta/filters', (_req, res) => {
  try {
    const categories = (db.prepare(`
      SELECT DISTINCT category FROM poems WHERE status = 'approved' AND category IS NOT NULL
    `).all() as { category: string }[]).map((r) => r.category);

    const poemAuthors = (db.prepare(`
      SELECT DISTINCT author FROM poems WHERE status = 'approved' AND author IS NOT NULL
    `).all() as { author: string }[]).map((r) => r.author);

    const bookAuthors = (db.prepare(`
      SELECT DISTINCT author FROM books WHERE author IS NOT NULL
    `).all() as { author: string }[]).map((r) => r.author);

    const authors = Array.from(new Set([...poemAuthors, ...bookAuthors])).sort((a, b) =>
      a.localeCompare(b, 'ta')
    );

    res.json({
      categories: ['அனைத்தும்', ...categories],
      authors: ['அனைத்தும்', ...authors],
    });
  } catch (err) {
    res.status(500).json({ error: 'வடிகட்டிகளை பெற இயலவில்லை' });
  }
});

// ==========================================
// 4. ADMIN AUTHENTICATION & MODERATION (PROTECTED)
// ==========================================

// Admin Login
apiRouter.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'பயனர்பெயர் மற்றும் கடவுச்சொல் தேவை (Username and password required)' });
  }

  const admin = verifyAdminCredentials(username, password);
  if (!admin) {
    return res.status(401).json({ error: 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல் (Invalid admin credentials)' });
  }

  const token = generateAdminToken(admin);
  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      username: admin.username,
    },
    message: 'நிர்வாகி உள்நுழைவு வெற்றிகரமானது (Admin login successful)',
  });
});

// Check Admin Status
apiRouter.get('/admin/me', requireAdminAuth, (req, res) => {
  res.json({
    authenticated: true,
    admin: (req as any).admin,
  });
});

// Admin Stats
apiRouter.get('/admin/stats', requireAdminAuth, (req, res) => {
  try {
    const totalPoems = (db.prepare('SELECT COUNT(*) as count FROM poems').get() as any).count;
    const pendingPoems = (db.prepare("SELECT COUNT(*) as count FROM poems WHERE status = 'pending'").get() as any).count;
    const approvedPoems = (db.prepare("SELECT COUNT(*) as count FROM poems WHERE status = 'approved'").get() as any).count;
    const rejectedPoems = (db.prepare("SELECT COUNT(*) as count FROM poems WHERE status = 'rejected'").get() as any).count;
    const totalBooks = (db.prepare('SELECT COUNT(*) as count FROM books').get() as any).count;
    const totalReads = (db.prepare('SELECT COALESCE(SUM(reads_count), 0) as count FROM poems').get() as any).count;
    const totalLikes = (db.prepare('SELECT COALESCE(SUM(likes_count), 0) as count FROM poems').get() as any).count;

    res.json({
      totalPoems,
      pendingPoems,
      approvedPoems,
      rejectedPoems,
      totalBooks,
      totalReads,
      totalLikes,
    });
  } catch (err) {
    res.status(500).json({ error: 'புள்ளிவிவரங்களை பெற இயலவில்லை' });
  }
});

// List all pending poems awaiting moderation
apiRouter.get('/admin/pending-poems', requireAdminAuth, (req, res) => {
  try {
    const pendingPoems = db.prepare(`
      SELECT id, title, author, content, category, contact_email, created_at, status
      FROM poems
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `).all();
    res.json({ poems: pendingPoems });
  } catch (err) {
    res.status(500).json({ error: 'நிலுவை கவிதைகளை பெற இயலவில்லை' });
  }
});

// List all poems (pending, approved, rejected)
apiRouter.get('/admin/all-poems', requireAdminAuth, (req, res) => {
  try {
    const poems = db.prepare(`
      SELECT id, title, author, content, category, status, contact_email, likes_count, reads_count, created_at
      FROM poems
      ORDER BY created_at DESC
    `).all();
    res.json({ poems });
  } catch (err) {
    res.status(500).json({ error: 'அனைத்து கவிதைகளையும் பெற இயலவில்லை' });
  }
});

// Moderate: Approve poem (publishes live)
apiRouter.post('/admin/poems/:id/approve', requireAdminAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const stmt = db.prepare(`
      UPDATE poems
      SET status = 'approved', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'கவிதை காணப்படவில்லை' });
    }

    res.json({ success: true, message: 'கவிதை வெற்றிகரமாக அங்கீகரிக்கப்பட்டு நேரலையில் வெளியிடப்பட்டது!' });
  } catch (err) {
    res.status(500).json({ error: 'கவிதையை அங்கீகரிப்பதில் பிழை' });
  }
});

// Moderate: Reject poem (marks rejected or deleted)
apiRouter.post('/admin/poems/:id/reject', requireAdminAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const stmt = db.prepare(`
      UPDATE poems
      SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'கவிதை காணப்படவில்லை' });
    }

    res.json({ success: true, message: 'கவிதை நிராகரிக்கப்பட்டது.' });
  } catch (err) {
    res.status(500).json({ error: 'கவிதையை நிராகரிப்பதில் பிழை' });
  }
});

// Moderate: Delete poem permanently
apiRouter.delete('/admin/poems/:id', requireAdminAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = db.prepare('DELETE FROM poems WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'கவிதை காணப்படவில்லை' });
    }

    res.json({ success: true, message: 'கவிதை நிரந்தரமாக நீக்கப்பட்டது.' });
  } catch (err) {
    res.status(500).json({ error: 'கவிதையை நீக்குவதில் பிழை' });
  }
});

// Admin direct poem publication
apiRouter.post('/admin/poems/create', requireAdminAuth, (req, res) => {
  try {
    const { title, author, content, category } = req.body;
    if (!title || !author || !content) {
      return res.status(400).json({ error: 'தலைப்பு, ஆசிரியர் மற்றும் வரிகள் தேவை' });
    }

    const cleanTitle = cleanPoetryText(sanitizeHtml(title));
    const cleanAuthor = cleanPoetryText(sanitizeHtml(author));
    const cleanContent = cleanPoetryText(content);
    const cleanCategory = category ? cleanPoetryText(sanitizeHtml(category)) : 'பொது';

    const stmt = db.prepare(`
      INSERT INTO poems (title, author, content, category, status)
      VALUES (?, ?, ?, ?, 'approved')
    `);
    const result = stmt.run(cleanTitle, cleanAuthor, cleanContent, cleanCategory);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'புதிய கவிதை நேரடியாக வெளியிடப்பட்டது!',
    });
  } catch (err) {
    res.status(500).json({ error: 'கவிதையை உருவாக்க இயலவில்லை' });
  }
});

// Admin add new book
apiRouter.post('/admin/books/create', requireAdminAuth, (req, res) => {
  try {
    const { title, tamil_title, author, description, cover_url, amazon_url, publication_year, isbn, pages, price_inr } = req.body;
    if (!title || !tamil_title || !author || !amazon_url) {
      return res.status(400).json({ error: 'நூல் விவரங்கள் முழுமையாக தேவை' });
    }

    const stmt = db.prepare(`
      INSERT INTO books (title, tamil_title, author, description, cover_url, amazon_url, publication_year, isbn, pages, price_inr, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    const result = stmt.run(
      sanitizeHtml(title),
      sanitizeHtml(tamil_title),
      sanitizeHtml(author),
      cleanPoetryText(description || ''),
      cover_url || '/src/assets/images/book_cover_kanavugal_1794242034346.jpg',
      amazon_url,
      parseInt(publication_year, 10) || 2026,
      isbn ? sanitizeHtml(isbn) : '',
      parseInt(pages, 10) || 150,
      parseInt(price_inr, 10) || 250
    );

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'புதிய நூல் வெற்றிகரமாக சேர்க்கப்பட்டது!',
    });
  } catch (err) {
    res.status(500).json({ error: 'நூலை சேர்க்க இயலவில்லை' });
  }
});

// User Promote Book submission ("உங்கள் புத்தகத்தை விளம்பரப்படுத்தவும்")
apiRouter.post('/books/promote', (req, res) => {
  try {
    const {
      title,
      tamil_title,
      author,
      description,
      amazon_url,
      cover_url,
      publication_year,
      isbn,
      pages,
      price_inr,
      contact_email,
    } = req.body;

    if (!tamil_title || !author || !amazon_url) {
      return res.status(400).json({
        error: 'புத்தகத்தின் தமிழ் பெயர், ஆசிரியர் பெயர் மற்றும் அமேசான் இணைப்பு ஆகியவை கட்டாயமானவை.',
      });
    }

    if (!amazon_url.startsWith('http://') && !amazon_url.startsWith('https://')) {
      return res.status(400).json({
        error: 'செல்லுபடியாகும் முழு அமேசான் இணைப்பை உள்ளிடவும் (e.g. https://www.amazon.in/dp/...)',
      });
    }

    const cleanTamilTitle = cleanPoetryText(sanitizeHtml(tamil_title)).substring(0, 200);
    const cleanTitle = title ? cleanPoetryText(sanitizeHtml(title)).substring(0, 200) : cleanTamilTitle;
    const cleanAuthor = cleanPoetryText(sanitizeHtml(author)).substring(0, 150);
    const cleanDesc = cleanPoetryText(sanitizeHtml(description || '')).substring(0, 3000);
    const cleanAmazonUrl = sanitizeHtml(amazon_url.trim());
    const cleanCoverUrl = cover_url ? sanitizeHtml(cover_url.trim()) : '/src/assets/images/book_cover_kanavugal_1794242034346.jpg';
    const cleanEmail = contact_email ? cleanPoetryText(sanitizeHtml(contact_email)) : null;

    const stmt = db.prepare(`
      INSERT INTO books (title, tamil_title, author, description, cover_url, amazon_url, publication_year, isbn, pages, price_inr, featured, status, contact_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?)
    `);

    const result = stmt.run(
      cleanTitle,
      cleanTamilTitle,
      cleanAuthor,
      cleanDesc,
      cleanCoverUrl,
      cleanAmazonUrl,
      parseInt(publication_year, 10) || new Date().getFullYear(),
      isbn ? sanitizeHtml(isbn) : '',
      parseInt(pages, 10) || 120,
      parseInt(price_inr, 10) || 200,
      cleanEmail
    );

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'உங்கள் புத்தகம் விளம்பரப்படுத்த வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! நிர்வாகி ஆய்வுக்குப் பிறகு விரைவில் அமேசான் நேரடி இணைப்புடன் காட்சிப்படுத்தப்படும்.',
    });
  } catch (err: any) {
    console.error('Book promotion submission error:', err);
    res.status(500).json({ error: 'புத்தகத்தை சமர்ப்பிப்பதில் பிழை ஏற்பட்டது.' });
  }
});

// Admin Pending Books List
apiRouter.get('/admin/pending-books', requireAdminAuth, (_req, res) => {
  try {
    const books = db.prepare(`
      SELECT id, title, tamil_title, author, description, cover_url, amazon_url, publication_year, isbn, pages, price_inr, status, contact_email, created_at
      FROM books
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `).all();
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: 'நிலுவை நூல்களைப் பெறுவதில் பிழை' });
  }
});

// Admin Approve Book
apiRouter.post('/admin/books/:id/approve', requireAdminAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const stmt = db.prepare(`UPDATE books SET status = 'approved' WHERE id = ?`);
    const result = stmt.run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'நூல் கிடைக்கவில்லை' });
    res.json({ success: true, message: 'புத்தகம் அங்கீகரிக்கப்பட்டு நேரலையில் விளம்பரப்படுத்தப்பட்டது!' });
  } catch (err) {
    res.status(500).json({ error: 'நூலை அங்கீகரிப்பதில் பிழை' });
  }
});

// Admin Reject Book
apiRouter.post('/admin/books/:id/reject', requireAdminAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const stmt = db.prepare(`UPDATE books SET status = 'rejected' WHERE id = ?`);
    const result = stmt.run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'நூல் கிடைக்கவில்லை' });
    res.json({ success: true, message: 'புத்தகம் நிராகரிக்கப்பட்டது.' });
  } catch (err) {
    res.status(500).json({ error: 'நூலை நிராகரிப்பதில் பிழை' });
  }
});

// Admin Delete Book
apiRouter.delete('/admin/books/:id', requireAdminAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = db.prepare(`DELETE FROM books WHERE id = ?`).run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'நூல் கிடைக்கவில்லை' });
    res.json({ success: true, message: 'புத்தகம் நீக்கப்பட்டது.' });
  } catch (err) {
    res.status(500).json({ error: 'நூலை நீக்குவதில் பிழை' });
  }
});

