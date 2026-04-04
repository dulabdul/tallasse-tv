export async function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.tallasseetv.com';
  
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/artikel', priority: '0.8', changefreq: 'daily' },
    { url: '/tentang-kami', priority: '0.5', changefreq: 'monthly' },
    { url: '/kontak', priority: '0.5', changefreq: 'monthly' },
    { url: '/kebijakan-privasi', priority: '0.3', changefreq: 'monthly' },
  ];

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
    <url>
      <loc>${siteUrl}${page.url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`
    )
    .join('')}
</urlset>`;

  return new Response(content, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
