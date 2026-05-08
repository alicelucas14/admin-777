const BLOG_IMAGE_BLOCK_PATTERN = /^!\[(.*?)\]\((.+)\)$/
const BLOG_HEADING_BLOCK_PATTERN = /^(#{1,3})\s+(.+)$/
const BLOG_CENTER_BLOCK_PATTERN = /^\[center\]([\s\S]+)\[\/center\]$/i
const PLAIN_IMAGE_URL_PATTERN = /^(https?:\/\/\S+\.(?:png|jpe?g|webp|avif|gif|svg)(?:\?\S*)?|data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)$/i
const INLINE_MARKDOWN_PATTERN = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g

export function parseBlogContentBlocks(content, fallbackBlocks = []) {
  const source = String(content || '').trim()

  if (!source) {
    return fallbackBlocks.map((text) => ({ type: 'paragraph', text }))
  }

  return source
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const imageMatch = part.match(BLOG_IMAGE_BLOCK_PATTERN)

      if (imageMatch) {
        return {
          type: 'image',
          alt: imageMatch[1]?.trim() || 'Blog image',
          src: imageMatch[2]?.trim() || '',
        }
      }

      if (PLAIN_IMAGE_URL_PATTERN.test(part)) {
        return {
          type: 'image',
          alt: 'Blog image',
          src: part,
        }
      }

      const headingMatch = part.match(BLOG_HEADING_BLOCK_PATTERN)

      if (headingMatch) {
        return {
          type: 'heading',
          level: Math.min(4, headingMatch[1].length + 1),
          text: headingMatch[2]?.trim() || '',
        }
      }

      const centerMatch = part.match(BLOG_CENTER_BLOCK_PATTERN)

      if (centerMatch) {
        return {
          type: 'centered',
          text: centerMatch[1]?.trim() || '',
        }
      }

      return {
        type: 'paragraph',
        text: part,
      }
    })
    .filter((block) => {
      if (block.type === 'image') {
        return Boolean(block.src)
      }

      return Boolean(block.text)
    })
}

export function getBlogExcerptText(content, maxLength = 120) {
  const text = stripBlogImageBlocks(content)

  if (!text) {
    return 'Discover the latest updates from the Stars777 team.'
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

export function parseInlineMarkdown(text) {
  const source = String(text || '')

  if (!source) {
    return []
  }

  const tokens = []
  let lastIndex = 0

  source.replace(INLINE_MARKDOWN_PATTERN, (match, _fullMatch, boldText, linkText, linkUrl, offset) => {
    if (offset > lastIndex) {
      tokens.push({ type: 'text', text: source.slice(lastIndex, offset) })
    }

    if (boldText) {
      tokens.push({ type: 'bold', text: boldText })
    } else if (linkText && linkUrl) {
      tokens.push({ type: 'link', text: linkText, href: linkUrl.trim() })
    } else {
      tokens.push({ type: 'text', text: match })
    }

    lastIndex = offset + match.length
    return match
  })

  if (lastIndex < source.length) {
    tokens.push({ type: 'text', text: source.slice(lastIndex) })
  }

  return tokens.filter((token) => Boolean(token.text))
}

function stripBlogImageBlocks(content) {
  return String(content || '')
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !BLOG_IMAGE_BLOCK_PATTERN.test(part) && !PLAIN_IMAGE_URL_PATTERN.test(part))
    .map((part) => {
      const headingMatch = part.match(BLOG_HEADING_BLOCK_PATTERN)

      if (headingMatch) {
        return headingMatch[2]?.trim() || ''
      }

      const centerMatch = part.match(BLOG_CENTER_BLOCK_PATTERN)

      if (centerMatch) {
        return centerMatch[1]?.trim() || ''
      }

      return part
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}