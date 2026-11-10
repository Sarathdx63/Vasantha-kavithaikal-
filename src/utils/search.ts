import { Poem, Book, SearchFilters, SearchResults } from '../types';

/**
 * Normalizes string for case-insensitive and trimmed comparison,
 * handling both Tamil Unicode and English characters.
 */
export function normalizeSearchTerm(str: string): string {
  if (!str) return '';
  return str.trim().toLowerCase();
}

/**
 * Calculates a search relevance score for a poem given a query.
 * Higher score = more relevant. 0 = no match.
 */
export function calculatePoemRelevance(poem: Poem, query: string): number {
  const q = normalizeSearchTerm(query);
  if (!q) return 1;

  let score = 0;
  const title = normalizeSearchTerm(poem.title);
  const author = normalizeSearchTerm(poem.author);
  const category = normalizeSearchTerm(poem.category);
  const content = normalizeSearchTerm(poem.content);

  // Exact title match: highest weight
  if (title === q) score += 100;
  else if (title.startsWith(q)) score += 60;
  else if (title.includes(q)) score += 40;

  // Author match
  if (author === q) score += 50;
  else if (author.includes(q)) score += 30;

  // Category match
  if (category === q) score += 25;
  else if (category.includes(q)) score += 15;

  // Content/verse match
  if (content.includes(q)) {
    // Give points for each occurrence up to 3
    const occurrences = (content.match(new RegExp(escapeRegex(q), 'g')) || []).length;
    score += Math.min(occurrences * 5, 20);
  }

  return score;
}

/**
 * Calculates a search relevance score for a book given a query.
 */
export function calculateBookRelevance(book: Book, query: string): number {
  const q = normalizeSearchTerm(query);
  if (!q) return 1;

  let score = 0;
  const tamilTitle = normalizeSearchTerm(book.tamil_title);
  const title = normalizeSearchTerm(book.title);
  const author = normalizeSearchTerm(book.author);
  const description = normalizeSearchTerm(book.description);
  const isbn = normalizeSearchTerm(book.isbn || '');

  // Exact Tamil title match
  if (tamilTitle === q) score += 100;
  else if (tamilTitle.startsWith(q)) score += 60;
  else if (tamilTitle.includes(q)) score += 40;

  // English title match
  if (title === q) score += 80;
  else if (title.includes(q)) score += 35;

  // Author match
  if (author === q) score += 50;
  else if (author.includes(q)) score += 30;

  // ISBN match
  if (isbn && isbn.includes(q)) score += 40;

  // Description match
  if (description.includes(q)) {
    score += 15;
  }

  return score;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts a contextual snippet highlighting the matched keyword
 */
export function extractMatchedSnippet(fullText: string, query: string, contextLength = 90): string {
  if (!fullText || !query) return fullText ? fullText.substring(0, contextLength) + '...' : '';

  const q = normalizeSearchTerm(query);
  const textLower = fullText.toLowerCase();
  const matchIndex = textLower.indexOf(q);

  if (matchIndex === -1) {
    return fullText.length > contextLength ? fullText.substring(0, contextLength) + '...' : fullText;
  }

  const start = Math.max(0, matchIndex - Math.floor(contextLength / 2));
  const end = Math.min(fullText.length, matchIndex + q.length + Math.floor(contextLength / 2));

  let snippet = fullText.substring(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < fullText.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Filters and sorts poems according to search filters.
 */
export function filterAndRankPoems(poems: Poem[], filters: Partial<SearchFilters>): Poem[] {
  const { query = '', category = 'அனைத்தும்', author = 'அனைத்தும்', sortBy = 'relevance' } = filters;
  const q = normalizeSearchTerm(query);

  let filtered = poems.filter((poem) => {
    // 1. Category filter
    if (category && category !== 'அனைத்தும்' && category !== 'all' && poem.category !== category) {
      return false;
    }

    // 2. Author filter
    if (author && author !== 'அனைத்தும்' && author !== 'all' && !poem.author.includes(author)) {
      return false;
    }

    // 3. Query match
    if (q) {
      const score = calculatePoemRelevance(poem, q);
      return score > 0;
    }

    return true;
  });

  // Sort
  if (q && sortBy === 'relevance') {
    filtered.sort((a, b) => calculatePoemRelevance(b, q) - calculatePoemRelevance(a, q));
  } else if (sortBy === 'popular') {
    filtered.sort((a, b) => (b.likes_count + b.reads_count) - (a.likes_count + a.reads_count));
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title, 'ta'));
  } else {
    // default: newest
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return filtered;
}

/**
 * Filters and sorts books according to search filters.
 */
export function filterAndRankBooks(books: Book[], filters: Partial<SearchFilters>): Book[] {
  const { query = '', author = 'அனைத்தும்', sortBy = 'relevance' } = filters;
  const q = normalizeSearchTerm(query);

  let filtered = books.filter((book) => {
    // 1. Author filter
    if (author && author !== 'அனைத்தும்' && author !== 'all' && !book.author.includes(author)) {
      return false;
    }

    // 2. Query match
    if (q) {
      const score = calculateBookRelevance(book, q);
      return score > 0;
    }

    return true;
  });

  // Sort
  if (q && sortBy === 'relevance') {
    filtered.sort((a, b) => calculateBookRelevance(b, q) - calculateBookRelevance(a, q));
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => a.tamil_title.localeCompare(b.tamil_title, 'ta'));
  } else {
    // default: newest publication year or featured
    filtered.sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0));
  }

  return filtered;
}

/**
 * Perform full unified search across poems and books
 */
export function performUnifiedSearch(
  poems: Poem[],
  books: Book[],
  filters: SearchFilters
): SearchResults {
  const matchedPoems = (filters.type === 'books') ? [] : filterAndRankPoems(poems, filters);
  const matchedBooks = (filters.type === 'poems') ? [] : filterAndRankBooks(books, filters);

  return {
    query: filters.query,
    totalMatches: matchedPoems.length + matchedBooks.length,
    poemMatchesCount: matchedPoems.length,
    bookMatchesCount: matchedBooks.length,
    poems: matchedPoems,
    books: matchedBooks,
  };
}

/**
 * Extracts unique list of author names from poems and books
 */
export function getAvailableAuthors(poems: Poem[], books: Book[]): string[] {
  const set = new Set<string>();

  poems.forEach((p) => {
    if (p.author && p.author.trim()) {
      set.add(p.author.trim());
    }
  });

  books.forEach((b) => {
    if (b.author && b.author.trim()) {
      set.add(b.author.trim());
    }
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b, 'ta'));
}
