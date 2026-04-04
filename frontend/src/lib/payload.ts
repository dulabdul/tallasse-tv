/**
 * Payload CMS API Client
 * Single Source of Truth untuk semua data fetching dari CMS
 */

const PAYLOAD_URL = import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
const API_BASE = `${PAYLOAD_URL}/api`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  sizes?: {
    thumbnail?: { url: string; width: number; height: number };
    card?: { url: string; width: number; height: number };
    hero?: { url: string; width: number; height: number };
  };
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  email?: string;
  profilePicture?: MediaItem;
  socialLinks?: Array<{
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'website';
    url: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface ArticleSeo {
  title?: string;
  description?: string;
  ogImage?: MediaItem;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: any; // Lexical JSON
  featuredImage: MediaItem;
  author: Author;
  categories?: Category[];
  readingTime?: number;
  status: 'draft' | 'published';
  publishedAt?: string;
  updatedAt: string;
  createdAt: string;
  seo?: ArticleSeo;
  jsonLd?: string; // New: Pre-generated JSON-LD from CMS
}

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  logo?: MediaItem;
  favicon?: MediaItem;
  defaultOgImage?: MediaItem;
  footerText?: string;
  footerDescription?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
    label?: string;
  }>;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  seo?: {
    gtmId?: string; // New: GTM ID
    defaultTitle?: string;
    defaultDescription?: string;
    googleVerification?: string;
  };
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// ── Fetch Helper ───────────────────────────────────────────────────────────────

async function fetchAPI<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
    // Cache for 60 seconds in production
    // @ts-ignore
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText} — ${url.toString()}`);
  }

  return res.json() as Promise<T>;
}

// ── Articles ───────────────────────────────────────────────────────────────────

export async function getArticles(opts: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  sort?: string;
} = {}): Promise<PaginatedResponse<Article>> {
  const { page = 1, limit = 9, categorySlug, sort = '-publishedAt' } = opts;

  const params: Record<string, string | number | boolean> = {
    page,
    limit,
    sort,
    depth: 2,
    'where[status][equals]': 'published',
  };

  if (categorySlug) {
    params['where[categories.slug][equals]'] = categorySlug;
  }

  return fetchAPI<PaginatedResponse<Article>>('/articles', params);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const data = await fetchAPI<PaginatedResponse<Article>>('/articles', {
      'where[slug][equals]': slug,
      'where[status][equals]': 'published',
      depth: 3,
      limit: 1,
    });
    return data.docs[0] || null;
  } catch {
    return null;
  }
}

export async function getRelatedArticles(
  articleId: string,
  categoryIds: string[],
  limit = 3
): Promise<Article[]> {
  if (!categoryIds.length) return [];

  try {
    const data = await fetchAPI<PaginatedResponse<Article>>('/articles', {
      'where[id][not_equals]': articleId,
      'where[status][equals]': 'published',
      'where[categories][in]': categoryIds.join(','),
      depth: 2,
      limit,
      sort: '-publishedAt',
    });
    return data.docs;
  } catch {
    return [];
  }
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  const data = await getArticles({ limit, sort: '-publishedAt' });
  return data.docs;
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const data = await getArticles({ limit: 1, sort: '-publishedAt' });
  return data.docs[0] || null;
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const data = await fetchAPI<PaginatedResponse<Article>>('/articles', {
    'where[status][equals]': 'published',
    limit: 1000,
  });
  return data.docs.map((a) => a.slug).filter(Boolean);
}

// ── Categories ─────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const data = await fetchAPI<PaginatedResponse<Category>>('/categories', {
    limit: 100,
    sort: 'name',
  });
  return data.docs;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const data = await fetchAPI<PaginatedResponse<Category>>('/categories', {
      'where[slug][equals]': slug,
      limit: 1,
    });
    return data.docs[0] || null;
  } catch {
    return null;
  }
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await getCategories();
  return categories.map((c) => c.slug).filter(Boolean);
}

// ── Authors ────────────────────────────────────────────────────────────────────

export async function getAuthors(): Promise<Author[]> {
  const data = await fetchAPI<PaginatedResponse<Author>>('/authors', {
    limit: 100,
    depth: 1,
  });
  return data.docs;
}

// ── Global Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await fetchAPI<SiteSettings>('/globals/site-settings', { depth: 2 });
  return data;
}

// ── Sitemap helpers ────────────────────────────────────────────────────────────

export async function getSitemapData(): Promise<{
  articles: Array<{ slug: string; updatedAt: string }>;
  categories: Array<{ slug: string }>;
}> {
  const [articlesData, categories] = await Promise.all([
    fetchAPI<PaginatedResponse<Article>>('/articles', {
      'where[status][equals]': 'published',
      limit: 1000,
      depth: 0,
    }),
    getCategories(),
  ]);

  return {
    articles: articlesData.docs.map((a) => ({ slug: a.slug, updatedAt: a.updatedAt })),
    categories: categories.map((c) => ({ slug: c.slug })),
  };
}

// ── Media URL helper ───────────────────────────────────────────────────────────

export function getMediaUrl(media?: MediaItem | null, size?: 'thumbnail' | 'card' | 'hero'): string {
  if (!media) return '/images/placeholder.jpg';
  if (size && media.sizes?.[size]?.url) {
    const sizeUrl = media.sizes[size]!.url;
    return sizeUrl.startsWith('http') ? sizeUrl : `${PAYLOAD_URL}${sizeUrl}`;
  }
  return media.url.startsWith('http') ? media.url : `${PAYLOAD_URL}${media.url}`;
}
