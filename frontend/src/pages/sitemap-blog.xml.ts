import { getSitemapData } from '../lib/payload';

export async function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.tallasseetv.com';
  
  try {
    const { articles } = await getSitemapData();

    const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${articles
    .map(
      (article) => `
    <url>
      <loc>${siteUrl}/artikel/${article.slug}</loc>
      <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
    )
    .join('')}
</urlset>`;

    return new Response(content, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Sitemap Blog Error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
