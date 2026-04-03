import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { s3Storage } from '@payloadcms/storage-s3'

import { Media } from './collections/Media.js'
import { Authors } from './collections/Authors.js'
import { Categories } from './collections/Categories.js'
import { Articles } from './collections/Articles.js'
import { Users } from './collections/Users.js'
import { SiteSettings } from './globals/SiteSettings.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // ── Admin Panel ───────────────────────────────────────
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— TallasseeTV CMS',
    },
    components: {
      graphics: {
        Logo: '/src/components/admin/Logo#Logo',
        Icon: '/src/components/admin/Icon#Icon',
      },
      views: {
        dashboard: {
          Component: '/src/components/admin/CustomDashboard#CustomDashboard',
        },
      },
    },
  },

  // ── Collections ───────────────────────────────────────
  collections: [Users, Media, Authors, Categories, Articles],

  // ── Globals ───────────────────────────────────────────
  globals: [SiteSettings],

  // ── Editor ───────────────────────────────────────────
  editor: lexicalEditor(),

  // ── Database (PostgreSQL / Supabase) ──────────────────
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  // ── TypeScript ────────────────────────────────────────
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // ── Uploads ───────────────────────────────────────────
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },

  // ── Plugins ───────────────────────────────────────────
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],

  // ── CORS & Security ───────────────────────────────────
  cors: [
    process.env.FRONTEND_URL || 'http://localhost:4321',
    'https://tallasseetv.com',
    'https://www.tallasseetv.com',
  ],
  csrf: [
    process.env.FRONTEND_URL || 'http://localhost:4321',
    'https://tallasseetv.com',
    'https://www.tallasseetv.com',
  ],

  // ── Secret ────────────────────────────────────────────
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-change-in-production',

  // ── Server URL ────────────────────────────────────────
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
})
