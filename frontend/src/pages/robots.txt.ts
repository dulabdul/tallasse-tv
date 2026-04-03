// robots.txt — auto-generated
export async function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://tallasseetv.com';
  const content = `# robots.txt — TallasseeTV
# Generated automatically

User-agent: *
Allow: /

# Block CMS admin panel from indexing
Disallow: /admin/
Disallow: /api/

# Allow search engines to follow pagination
Allow: /artikel?halaman=
Allow: /kategori/

# Sitemap
Sitemap: ${siteUrl}/sitemap-index.xml

# Crawl delay (optional, in seconds)
Crawl-delay: 1
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
