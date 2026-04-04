export async function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.tallasseetv.com';
  
  const content = `# robots.txt — TallasseeTV
# Generated automatically for SEO

User-agent: *
Allow: /

# Sitemap Index
Sitemap: ${siteUrl}/sitemap.xml

# Restricted areas
Disallow: /admin/
Disallow: /api/
Disallow: /_astro/
Disallow: /_payload/

# Crawl delay
Crawl-delay: 1
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
