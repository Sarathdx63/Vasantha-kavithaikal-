import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePoemRelevance,
  calculateBookRelevance,
  extractMatchedSnippet,
  filterAndRankPoems,
  filterAndRankBooks,
  performUnifiedSearch,
  getAvailableAuthors,
} from './search';
import { Poem, Book, SearchFilters } from '../types';

const mockPoems: Poem[] = [
  {
    id: 1,
    title: 'வசந்தத்தின் முதல் அழைப்பு',
    author: 'வசந்தகுமார்',
    content: 'பனிக்காலத்து இலை உதிர்தலின் முடிவில் மெல்லத் தலையசைக்கும் பசுந்தளிரே...',
    category: 'இயற்கை',
    status: 'approved',
    likes_count: 40,
    reads_count: 200,
    downloads_count: 10,
    created_at: '2026-01-01',
  },
  {
    id: 2,
    title: 'செந்தமிழ்த் தேன் சுவை',
    author: 'சுப்பிரமணிய பாரதியார்',
    content: 'யாமறிந்த மொழிகளிலே தமிழ்மொழி போல் இனிதாவது எங்கும் காணோம்...',
    category: 'தமிழ் பெருமை',
    status: 'approved',
    likes_count: 80,
    reads_count: 500,
    downloads_count: 30,
    created_at: '2026-02-01',
  },
  {
    id: 3,
    title: 'மௌனத்தின் மொழி',
    author: 'அருண்மொழி வர்மன்',
    content: 'பேசாத சொற்களுக்குள் ஆயிரம் கவிதைகள் உறங்குகின்றன...',
    category: 'காதல்',
    status: 'approved',
    likes_count: 60,
    reads_count: 300,
    downloads_count: 20,
    created_at: '2026-03-01',
  },
];

const mockBooks: Book[] = [
  {
    id: 1,
    title: 'Shadow of Dreams',
    tamil_title: 'கனவுகளின் நிழல்',
    author: 'கவிஞர் வசந்தன் (Vasanthan)',
    description: 'மனித மனத்தின் ஆழ்ந்த அமைதியையும், கனவுகளின் எல்லையற்ற சிறகுகளையும் பேசும் தொகுப்பு...',
    cover_url: '/img1.jpg',
    amazon_url: 'https://amazon.in/1',
    publication_year: 2025,
    isbn: '978-93-87654-21-0',
    pages: 192,
    price_inr: 280,
  },
  {
    id: 2,
    title: 'Fingers of Rain',
    tamil_title: 'மழையின் விரல்கள்',
    author: 'கவிஞர் பாரதிதாசன் வழித்தோன்றல்',
    description: 'மழைத் துளிகள் பூமிக்கு எழுதும் ரகசியக் கடிதங்கள்...',
    cover_url: '/img2.jpg',
    amazon_url: 'https://amazon.in/2',
    publication_year: 2026,
    isbn: '978-93-87654-88-3',
    pages: 176,
    price_inr: 260,
  },
];

test('calculatePoemRelevance: scores matches in title, author, and content', () => {
  // Title match scores high
  const titleScore = calculatePoemRelevance(mockPoems[0], 'வசந்தத்தின்');
  assert.ok(titleScore >= 40);

  // Author match
  const authorScore = calculatePoemRelevance(mockPoems[1], 'பாரதியார்');
  assert.ok(authorScore >= 30);

  // Content match
  const contentScore = calculatePoemRelevance(mockPoems[2], 'சொற்களுக்குள்');
  assert.ok(contentScore > 0);

  // No match gives 0
  const noMatch = calculatePoemRelevance(mockPoems[0], 'விண்வெளி_கணிப்பொறி');
  assert.equal(noMatch, 0);
});

test('calculateBookRelevance: scores matches in tamil_title, english title, and author', () => {
  const tamilTitleScore = calculateBookRelevance(mockBooks[1], 'மழையின் விரல்கள்');
  assert.ok(tamilTitleScore >= 60);

  const englishTitleScore = calculateBookRelevance(mockBooks[0], 'Shadow of Dreams');
  assert.ok(englishTitleScore >= 80);

  const authorScore = calculateBookRelevance(mockBooks[0], 'வசந்தன்');
  assert.ok(authorScore >= 30);
});

test('filterAndRankPoems: filters by category, author, and query', () => {
  // Filter by category
  const naturePoems = filterAndRankPoems(mockPoems, { category: 'இயற்கை' });
  assert.equal(naturePoems.length, 1);
  assert.equal(naturePoems[0].title, 'வசந்தத்தின் முதல் அழைப்பு');

  // Filter by query
  const searchResults = filterAndRankPoems(mockPoems, { query: 'மொழி' });
  // Matches "செந்தமிழ்த் தேன் சுவை" (content has 'தமிழ்மொழி') and "மௌனத்தின் மொழி" (title has 'மொழி')
  assert.equal(searchResults.length, 2);
  // "மௌனத்தின் மொழி" has title match, so should be ranked first
  assert.equal(searchResults[0].title, 'மௌனத்தின் மொழி');
});

test('performUnifiedSearch: searches both poems and books and respects type filter', () => {
  const filtersAll: SearchFilters = {
    query: 'வசந்த',
    type: 'all',
    category: 'அனைத்தும்',
    author: 'அனைத்தும்',
    sortBy: 'relevance',
  };
  const resultsAll = performUnifiedSearch(mockPoems, mockBooks, filtersAll);
  // Matches poem "வசந்தத்தின் முதல் அழைப்பு" & book "கவிஞர் வசந்தன்"
  assert.ok(resultsAll.poemMatchesCount >= 1);
  assert.ok(resultsAll.bookMatchesCount >= 1);
  assert.equal(resultsAll.totalMatches, resultsAll.poemMatchesCount + resultsAll.bookMatchesCount);

  // Test type='books' only
  const resultsBooksOnly = performUnifiedSearch(mockPoems, mockBooks, { ...filtersAll, type: 'books' });
  assert.equal(resultsBooksOnly.poemMatchesCount, 0);
  assert.ok(resultsBooksOnly.bookMatchesCount >= 1);

  // Test type='poems' only
  const resultsPoemsOnly = performUnifiedSearch(mockPoems, mockBooks, { ...filtersAll, type: 'poems' });
  assert.ok(resultsPoemsOnly.poemMatchesCount >= 1);
  assert.equal(resultsPoemsOnly.bookMatchesCount, 0);
});

test('extractMatchedSnippet: extracts snippet around match with ellipsis', () => {
  const text = 'ஆரம்ப வரிகள் இங்கே உள்ளன. வசந்தத்தின் மலர்கள் பூத்து குலுங்குகின்றன. இறுதி வரிகள் இங்கே.';
  const snippet = extractMatchedSnippet(text, 'வசந்தத்தின்', 30);
  assert.ok(snippet.includes('வசந்தத்தின்'));
  assert.ok(snippet.includes('...'));
});

test('getAvailableAuthors: extracts sorted list of authors across poems and books', () => {
  const authors = getAvailableAuthors(mockPoems, mockBooks);
  assert.ok(authors.includes('வசந்தகுமார்'));
  assert.ok(authors.includes('சுப்பிரமணிய பாரதியார்'));
  assert.ok(authors.includes('அருண்மொழி வர்மன்'));
  assert.ok(authors.length >= 4);
});
