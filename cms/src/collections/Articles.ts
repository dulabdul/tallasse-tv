import type { CollectionConfig, FieldHook, Where } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

/**
 * Calculate estimated reading time from Lexical content
 * ~200 words per minute (Indonesian average)
 */
const calculateReadingTime = (contentBlocks: any[]): number => {
  if (!contentBlocks || !Array.isArray(contentBlocks)) return 1
  let text = ''
  
  const extractText = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.text) text += node.text + ' '
      if (node.children) extractText(node.children)
    }
  }

  contentBlocks.forEach(block => {
    if (block.blockType === 'richText' && block.text?.root?.children) {
      extractText(block.text.root.children)
    } else if (block.blockType === 'quote' && block.text) {
      text += block.text + ' '
    }
  })

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

const generateSlug: FieldHook = ({ value, data }) => {
  if (!value && data?.title) {
    return data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  return value
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Artikel',
    plural: 'Artikel',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt'],
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.FRONTEND_URL || 'http://localhost:4321'}/artikel/${doc.slug}`
      }
      return null
    },
  },
  access: {
    read: ({ req }): boolean | Where => {
      // Published articles are public; drafts need auth
      if (req.user) return true
      return {
        and: [
          { status: { equals: 'published' } },
          { publishedAt: { less_than_equal: new Date().toISOString() } },
        ],
      }
    },
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Auto-calculate reading time before saving
        if (data.content) {
          data.readingTime = calculateReadingTime(data.content)
        }
        
        // Auto-set publishedAt if status becomes 'published' and it's empty
        if (data.status === 'published' && (!data.publishedAt && !originalDoc?.publishedAt)) {
          data.publishedAt = new Date().toISOString()
        }
        
        return data
      },
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
    },
  },
  // ── Blocks for WP-like Editor ──────────────────────────
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Konten Artikel',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Judul Artikel',
              required: true,
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Ringkasan Singkat (Excerpt)',
              admin: {
                description: 'Deskripsi pengantar sebelum membaca konten.',
              },
            },
            {
              name: 'content',
              type: 'blocks',
              label: 'Penulis Konten (Block Builder)',
              minRows: 1,
              blocks: [
                {
                  slug: 'richText',
                  labels: { singular: 'Paragraf / Teks', plural: 'Teks' },
                  fields: [
                    {
                      name: 'text',
                      type: 'richText',
                      required: true,
                      editor: lexicalEditor({
                        features: ({ defaultFeatures }) => [...defaultFeatures],
                      }),
                    },
                  ],
                },
                {
                  slug: 'image',
                  labels: { singular: 'Gambar / Media', plural: 'Gambar' },
                  fields: [
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'caption',
                      type: 'text',
                      label: 'Keterangan Gambar',
                    },
                  ],
                },
                {
                  slug: 'quote',
                  labels: { singular: 'Kutipan Menarik', plural: 'Kutipan' },
                  fields: [
                    {
                      name: 'text',
                      type: 'textarea',
                      required: true,
                      label: 'Teks Kutipan',
                    },
                    {
                      name: 'author',
                      type: 'text',
                      label: 'Disampaikan Oleh',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Pengaturan & SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'Meta SEO',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'SEO Title (Maks 60 Karakter)',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Meta Description',
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'OG Image (Preview Sosial Media)',
                },
                {
                  name: 'canonicalUrl',
                  type: 'text',
                  label: 'Canonical URL',
                },
                {
                  name: 'noIndex',
                  type: 'checkbox',
                  label: 'Sembunyikan dari Search Engine',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      ],
    },
    // ── Sidebar Fields ──────────────────────────────────────
    {
      name: 'slug',
      type: 'text',
      label: 'Slug URL',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated. Bisa diubah manual.',
      },
      hooks: {
        beforeValidate: [generateSlug],
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar Utama (Cover)',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status Publikasi',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Tanggal Tayang',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      label: 'Penulis',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Kategori',
      hasMany: true,
      maxRows: 2,
      admin: { position: 'sidebar' },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: 'Waktu Baca (menit)',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Dihitung otomatis',
      },
    },
  ],
}
