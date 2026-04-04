import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Pengaturan Situs',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: 'Nama Situs',
      required: true,
      defaultValue: 'TallasseeTV',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      defaultValue: 'Berita & Informasi Terkini',
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo Situs',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      label: 'Favicon',
      relationTo: 'media',
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      label: 'Default OG Image',
      relationTo: 'media',
      admin: {
        description: 'Digunakan sebagai fallback ketika artikel tidak memiliki OG Image',
      },
    },

    // ── Footer ───────────────────────────────────────────
    {
      name: 'footerText',
      type: 'text',
      label: 'Teks Footer',
      defaultValue: '© 2025 TallasseeTV. Semua hak dilindungi.',
    },
    {
      name: 'footerDescription',
      type: 'textarea',
      label: 'Deskripsi Footer',
      defaultValue: 'Menyajikan berita dan informasi terkini yang akurat dan terpercaya untuk masyarakat.',
    },

    // ── Social Media ─────────────────────────────────────
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Tautan Media Sosial',
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Platform',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'WhatsApp', value: 'whatsapp' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label',
        },
      ],
    },

    // ── Contact ───────────────────────────────────────────
    {
      name: 'contact',
      type: 'group',
      label: 'Informasi Kontak',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          defaultValue: 'redaksi@tallasseetv.com',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Nomor Telepon / WhatsApp',
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Alamat',
        },
      ],
    },

    // ── SEO Sitewide ──────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Global',
      fields: [
        {
          name: 'gtmId',
          type: 'text',
          label: 'Google Tag Manager ID',
          admin: {
            description: 'Format: GTM-XXXXXXX. Kosongkan jika tidak digunakan.',
          },
        },
        {
          name: 'defaultTitle',
          type: 'text',
          label: 'Default Title Template',
          defaultValue: '%s — TallasseeTV',
          admin: {
            description: 'Gunakan %s sebagai placeholder untuk judul halaman',
          },
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          label: 'Default Meta Description',
          defaultValue:
            'TallasseeTV — Menyajikan berita dan informasi terkini yang akurat dan terpercaya untuk masyarakat.',
        },
        {
          name: 'googleVerification',
          type: 'text',
          label: 'Google Search Console Verification',
        },
      ],
    },
  ],
}
