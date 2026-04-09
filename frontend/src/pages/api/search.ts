import type { APIRoute } from 'astro';
import sql from '@/lib/db';

export const prerender = false;

// Media URL construction logic (Direct from S3)
const S3_BASE_URL = import.meta.env.NEXT_PUBLIC_S3_URL || 'https://cpyozwqiusuvgdluudgn.supabase.co/storage/v1/object/public/tallasseetv-media';

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
    console.log(`\x1b[35m[Direct Search]\x1b[0m Executing SQL FTS for: "${query}"`);

    /**
     * ADVANCED POSTGRES SEARCH STRATEGY:
     * 1. Primary: Full-Text Search (FTS) with Vector Ranking
     * 2. Select only required fields for speed
     * 3. Join with media table to get filename in one go
     */
    let results = await sql`
      SELECT 
        a.title, 
        a.slug, 
        a.published_at as date, 
        m.filename
      FROM articles a
      LEFT JOIN media m ON a.featured_image_id = m.id
      WHERE a.status = 'published'
        AND to_tsvector('simple', a.title) @@ plainto_tsquery('simple', ${query})
      ORDER BY 
        ts_rank(to_tsvector('simple', a.title), plainto_tsquery('simple', ${query})) DESC,
        a.published_at DESC
      LIMIT 8
    `;

    // FALLBACK: If FTS returns 0, try lightweight ILIKE for partial word fragments
    if (results.length === 0) {
      console.log(`\x1b[33m[Search Fallback]\x1b[0m FTS yielded 0, trying ILIKE...`);
      results = await sql`
        SELECT 
          a.title, 
          a.slug, 
          a.published_at as date, 
          m.filename
        FROM articles a
        LEFT JOIN media m ON a.featured_image_id = m.id
        WHERE a.status = 'published'
          AND a.title ILIKE ${'%' + query + '%'}
        ORDER BY a.published_at DESC
        LIMIT 8
      `;
    }

    const duration = Date.now() - startTime;
    console.log(`\x1b[32m[Search Success]\x1b[0m Found ${results.length} results in ${duration}ms`);

    // Map DB results to Frontend Contract
    const formattedResults = results.map(row => ({
      title: row.title,
      slug: row.slug,
      date: row.date,
      // Construct URL directly bypassing CMS helper for speed
      imageUrl: row.filename 
        ? `${S3_BASE_URL}/${row.filename}`
        : '/images/placeholder.jpg'
    }));

    return new Response(JSON.stringify({ results: formattedResults }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
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
