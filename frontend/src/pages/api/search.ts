import type { APIRoute } from 'astro';
import { getMediaUrl } from '@/lib/payload';

// Force SSR to prevent caching issues in development/production
export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  const query = url.searchParams.get('q');
  
  // High-visibility log to confirm the API is being hit
  console.log(`\x1b[35m[Search API]\x1b[0m Received query: "${query}" at ${new Date().toLocaleTimeString()}`);

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const PAYLOAD_URL = import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const apiUrl = new URL(`${PAYLOAD_URL}/api/articles`);
    
    /**
     * Payload v3 Query Syntax Refinement
     * We use where[title][contains] for partial matching.
     * Ensure status is published.
     */
    apiUrl.searchParams.set('where[title][contains]', query);
    apiUrl.searchParams.set('where[status][equals]', 'published');
    apiUrl.searchParams.set('limit', '8');
    apiUrl.searchParams.set('depth', '1');

    console.log(`\x1b[36m[Payload Request]\x1b[0m ${apiUrl.toString()}`);

    const res = await fetch(apiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`\x1b[31m[Payload Error]\x1b[0m Status ${res.status}: ${errorText}`);
      throw new Error(`Payload response not OK: ${res.status}`);
    }

    const data = await res.json();
    const docs = data.docs || [];
    
    console.log(`\x1b[32m[Search Success]\x1b[0m Found ${docs.length} articles for "${query}"`);

    const results = docs.map((doc: any) => ({
      title: doc.title,
      slug: doc.slug,
      date: doc.publishedAt || doc.createdAt,
      imageUrl: getMediaUrl(doc.featuredImage, 'thumbnail')
    }));

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'CDN-Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    console.error(`\x1b[31m[Search API Critical Error]\x1b[0m`, error);
    return new Response(JSON.stringify({ error: 'Search failed', results: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
