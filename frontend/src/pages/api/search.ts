import type { APIRoute } from 'astro';
import sql from '@/lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim();
  
  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const startTime = Date.now();
    console.log(`\x1b[35m[Performance Search]\x1b[0m Query: "${query}"`);

    /**
     * OPTIMIZED SQL FOR SPEED (Text-Only):
     * 1. Remove Media JOIN to eliminate large binary metadata overhead.
     * 2. Efficiently pull primary category via correlated subquery.
     * 3. Select only strictly necessary string fields.
     */
    let results = await sql`
      SELECT 
        a.title, 
        a.slug, 
        a.published_at as date,
        (
          SELECT c.name 
          FROM categories c
          JOIN articles_rels ar ON ar.categories_id = c.id
          WHERE ar.parent_id = a.id AND ar.path = 'categories'
          LIMIT 1
        ) as category
      FROM articles a
      WHERE a.status = 'published'
        AND to_tsvector('simple', a.title) @@ plainto_tsquery('simple', ${query})
      ORDER BY 
        ts_rank(to_tsvector('simple', a.title), plainto_tsquery('simple', ${query})) DESC,
        a.published_at DESC
      LIMIT 8
    `;

    // FALLBACK: Lightweight ILIKE if FTS fails
    if (results.length === 0) {
      console.log(`\x1b[33m[Search Fallback]\x1b[0m No FTS results, trying ILIKE...`);
      results = await sql`
        SELECT 
          a.title, 
          a.slug, 
          a.published_at as date,
          (
            SELECT c.name 
            FROM categories c
            JOIN articles_rels ar ON ar.categories_id = c.id
            WHERE ar.parent_id = a.id AND ar.path = 'categories'
            LIMIT 1
          ) as category
        FROM articles a
        WHERE a.status = 'published'
          AND a.title ILIKE ${'%' + query + '%'}
        ORDER BY a.published_at DESC
        LIMIT 8
      `;
    }

    const duration = Date.now() - startTime;
    console.log(`\x1b[32m[Search Success]\x1b[0m JSON Response generated in ${duration}ms`);

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120'
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
