export interface Poem {
  id: number;
  title: string;
  author: string;
  content: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  contact_email?: string;
  likes_count: number;
  reads_count: number;
  downloads_count: number;
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  tamil_title: string;
  author: string;
  description: string;
  cover_url: string;
  amazon_url: string;
  publication_year: number;
  isbn?: string;
  pages?: number;
  price_inr?: number;
  featured?: number;
  status?: 'approved' | 'pending' | 'rejected';
  contact_email?: string;
}

export type AppView = 'home' | 'poems' | 'books' | 'submit_poem' | 'download' | 'promote_book';

export interface AdminUser {
  id: number;
  username: string;
}

export interface CaptchaChallenge {
  token: string;
  question: string;
  tamilHint: string;
  type: 'math' | 'tamil_number' | 'word';
}

export interface AdminStats {
  totalPoems: number;
  pendingPoems: number;
  approvedPoems: number;
  rejectedPoems: number;
  totalBooks: number;
  totalReads: number;
  totalLikes: number;
}

export type SearchContentType = 'all' | 'poems' | 'books';

export interface SearchResults {
  query: string;
  totalMatches: number;
  poemMatchesCount: number;
  bookMatchesCount: number;
  poems: Poem[];
  books: Book[];
}

export interface SearchFilters {
  query: string;
  type: SearchContentType;
  category: string;
  author: string;
  sortBy: 'relevance' | 'newest' | 'popular' | 'title';
}

