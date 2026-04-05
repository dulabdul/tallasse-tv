/**
 * Utility helpers — TallasseeTV Blog
 */

// ── Date formatting ────────────────────────────────────────────────────────────

const LOCALE = 'id-ID';

export function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
    ...opts,
  });
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatISODate(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

// ── Reading time ───────────────────────────────────────────────────────────────

export function formatReadingTime(minutes: number): string {
  return `${minutes} menit baca`;
}

// ── String utils ───────────────────────────────────────────────────────────────

export function truncate(str: string, length = 160): string {
  if (str.length <= length) return str;
  return str.slice(0, length).replace(/\s+\S*$/, '') + '…';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── Lexical rich text → plain text ────────────────────────────────────────────

export function lexicalToPlainText(content: any): string {
  if (!content?.root?.children) return '';
  let text = '';
  const extract = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.text) text += node.text + ' ';
      if (node.children) extract(node.children);
    }
  };
  extract(content.root.children);
  return text.trim();
}

// ── Lexical rich text → HTML ───────────────────────────────────────────────────

function serializeNode(node: any): string {
  if (!node) return '';

  if (node.type === 'text') {
    let text = escapeHtml(node.text || '');
    if (node.format & 1) text = `<strong>${text}</strong>`;
    if (node.format & 2) text = `<em>${text}</em>`;
    if (node.format & 8) text = `<u>${text}</u>`;
    if (node.format & 4) text = `<s>${text}</s>`;
    if (node.format & 16) text = `<code>${text}</code>`;
    return text;
  }

  const children = (node.children || []).map(serializeNode).join('');

  switch (node.type) {
    case 'root':
      return children;
    case 'paragraph':
      return children ? `<p>${children}</p>` : '';
    case 'heading': {
      const level = node.tag || 'h2';
      const id = generateHeadingId(node.children || []);
      return `<${level} id="${id}">${children}</${level}>`;
    }
    case 'list':
      return node.listType === 'bullet'
        ? `<ul>${children}</ul>`
        : `<ol>${children}</ol>`;
    case 'listitem':
      return `<li>${children}</li>`;
    case 'link': {
      const url = node.fields?.url || '#';
      const newTab = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}"${newTab}>${children}</a>`;
    }
    case 'quote':
      return `<blockquote>${children}</blockquote>`;
    case 'code':
      return `<pre><code>${escapeHtml(node.code || '')}</code></pre>`;
    case 'horizontalrule':
      return '<hr>';
    case 'image': {
      const src = node.src || '';
      const alt = node.altText || '';
      const cap = node.caption ? `<figcaption>${node.caption}</figcaption>` : '';
      return `<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy">${cap}</figure>`;
    }
    default:
      return children;
  }
}

function generateHeadingId(children: any[]): string {
  const text = children.map((c: any) => c.text || '').join('');
  return slugify(text);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function lexicalToHtml(content: any): string {
  if (!content?.root) return '';
  return serializeNode(content.root);
}

export function blocksToHtml(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks.map(block => {
    switch (block.blockType) {
      case 'richText':
        return lexicalToHtml(block.text);
      case 'image':
        const media = block.media;
        if (!media?.url) return '';
        // If Payload v3 uses absolute paths or we prefix:
        const url = media.url;
        const align = block.align || 'center';
        return `
          <figure class="align-${align}">
            <img src="${url}" alt="${escapeHtml(media.alt || '')}" loading="lazy" />
            ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
          </figure>
        `;
      case 'quote':
        return `
          <blockquote class="custom-quote">
            <p>${escapeHtml(block.text || '')}</p>
            ${block.author ? `<cite>— ${escapeHtml(block.author)}</cite>` : ''}
          </blockquote>
        `;
      default:
        return '';
    }
  }).join('');
}

// ── Extract headings for Table of Contents ────────────────────────────────────

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(contentBlocks: any[]): Heading[] {
  const headings: Heading[] = [];
  if (!contentBlocks || !Array.isArray(contentBlocks)) return headings;

  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.type === 'heading') {
        const text = (node.children || []).map((c: any) => c.text || '').join('');
        const level = parseInt(node.tag?.replace('h', '') || '2', 10);
        headings.push({ id: generateHeadingId(node.children || []), text, level });
      }
      if (node.children) walk(node.children);
    }
  };

  for (const block of contentBlocks) {
    if (block.blockType === 'richText' && block.text?.root?.children) {
      walk(block.text.root.children);
    }
  }

  return headings;
}

// ── Social share URLs ──────────────────────────────────────────────────────────

export function getSocialShareUrls(url: string, title: string) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
  };
}

// ── Platform icon mapping ─────────────────────────────────────────────────────

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    facebook: '📘',
    instagram: '📸',
    twitter: '𝕏',
    linkedin: '💼',
    youtube: '▶️',
    tiktok: '🎵',
    whatsapp: '💬',
    website: '🌐',
  };
  return icons[platform] || '🔗';
}

// ── cn utility ────────────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
