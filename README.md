# TallasseeTV Blog

Website blog modern untuk **tallasseetv.com** dibangun dengan:
- 🚀 **Frontend**: [Astro v5](https://astro.build) + Tailwind CSS v4
- 🎛️ **CMS Backend**: [Payload CMS v3](https://payloadcms.com) (Headless)
- 🗄️ **Database**: PostgreSQL (Supabase)

## Struktur Folder

```
tallasseetv-blog/
├── frontend/          ← Astro v5 (Static Site)
└── cms/               ← Payload CMS v3 (Headless API)
```

## Setup Cepat

### 1. Clone & Install

```bash
# Install CMS dependencies
cd cms
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Konfigurasi Environment Variables

**CMS** (`cms/.env`):
```env
DATABASE_URI=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
PAYLOAD_SECRET=your-super-secret-min-32-chars
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4321
```

**Frontend** (`frontend/.env`):
```env
PUBLIC_PAYLOAD_URL=http://localhost:3000
PUBLIC_SITE_URL=https://tallasseetv.com
```

### 3. Jalankan Development Server

**Terminal 1 — CMS:**
```bash
cd cms && npm run dev
# Buka: http://localhost:3000/admin
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
# Buka: http://localhost:4321
```

## Fitur

### CMS (Payload v3)
- ✅ Collections: `Authors`, `Categories`, `Articles`, `Media`
- ✅ Global: `SiteSettings` (nama situs, logo, footer, social links)
- ✅ Auto-generated slug dari judul
- ✅ Auto-calculated reading time (hook `beforeChange`)
- ✅ Draft/Published workflow dengan autosave
- ✅ SEO fields per artikel (custom title, description, OG image, canonical URL)
- ✅ PostgreSQL adapter (Supabase-compatible)
- ✅ CORS dikonfigurasi untuk frontend

### Frontend (Astro v5)
- ✅ SSG (Static Site Generation) — semua halaman di-generate saat build
- ✅ Dark/Light mode dengan CSS custom properties (tanpa FOUC)
- ✅ Responsive — mobile-first design
- ✅ SEO: Dynamic meta tags, Open Graph, Twitter Card
- ✅ JSON-LD: `BlogPosting`, `BreadcrumbList`, `WebSite` schema
- ✅ Table of Contents — auto dari heading, highlight aktif saat scroll
- ✅ Social Share: Facebook, X, LinkedIn, WhatsApp, Copy Link
- ✅ Pagination dengan sistem ellipsis
- ✅ Related Articles berdasarkan kategori
- ✅ Reading Time estimasi
- ✅ robots.txt & sitemap.xml auto-generated
- ✅ 404 page kustom
- ✅ Halaman: Beranda, Artikel, Kategori, Tentang Kami, Kontak, Kebijakan Privasi

## API Endpoints (Payload CMS)

| Endpoint | Deskripsi |
|----------|-----------|
| `GET /api/articles` | Daftar artikel |
| `GET /api/articles?where[slug][equals]=slug` | Artikel by slug |
| `GET /api/categories` | Semua kategori |
| `GET /api/authors` | Semua penulis |
| `GET /api/globals/site-settings` | Pengaturan situs |
| `GET /admin` | Admin panel |

## Deployment

### CMS (Railway / Render)
1. Push folder `cms/` ke repository terpisah
2. Set environment variables di dashboard
3. Deploy dengan `npm run build && npm start`

### Frontend (Vercel)
1. Push folder `frontend/` ke repository
2. Set `PUBLIC_PAYLOAD_URL` ke URL CMS production
3. Build command: `npm run build`
4. Output dir: `dist`

## Kontak

- Website: [tallasseetv.com](https://tallasseetv.com)
- Email: redaksi@tallasseetv.com
