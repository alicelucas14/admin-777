import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

function SeoManager() {
  const location = useLocation()
  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      document.title = 'Admin'
      setMeta('robots', 'noindex,nofollow,noarchive')
      setMeta('googlebot', 'noindex,nofollow,noarchive,nosnippet')
      return
    }

    let isMounted = true
    const pageSeo = getPageSeo(location.pathname)

    applySeo(buildSeoPayload({
      pathname: location.pathname,
      pageSeo,
    }))

    const updateSeo = async () => {
      try {
        const [settingsResponse, detailResponse] = await Promise.all([
          fetch(`${publicApiBase}/site-settings`),
          fetchDetailSeoResource(publicApiBase, location.pathname),
        ])

        const settings = settingsResponse.ok ? await settingsResponse.json() : null
        const detail = detailResponse && detailResponse.ok ? await detailResponse.json() : null
        if (!isMounted) {
          return
        }

        applySeo(buildSeoPayload({
          pathname: location.pathname,
          pageSeo,
          settings,
          detail,
        }))
      } catch {
        // SEO falls back to the static index.html tags when the API is unavailable.
      }
    }

    updateSeo()

    return () => {
      isMounted = false
    }
  }, [location.pathname, publicApiBase])

  return null
}

function applySeo(payload) {
  document.title = payload.title
  setMeta('robots', payload.robots)
  setMeta('description', payload.description)
  setMeta('keywords', payload.keywords)
  setMetaProperty('og:title', payload.title)
  setMetaProperty('og:description', payload.description)
  setMetaProperty('og:type', 'website')
  setMetaProperty('og:url', payload.canonical)
  setMetaProperty('og:site_name', payload.siteName)
  setMetaProperty('og:image', payload.ogImageUrl)
  setMetaProperty('og:image:alt', payload.ogImageAlt)
  setMeta('twitter:card', payload.ogImageUrl ? 'summary_large_image' : 'summary')
  setMeta('twitter:title', payload.title)
  setMeta('twitter:description', payload.description)
  setMeta('twitter:url', payload.canonical)
  setMeta('twitter:image', payload.ogImageUrl)
  setCanonical(payload.canonical)
}

function buildSeoPayload({ pathname, pageSeo, settings, detail }) {
  const siteName = settings?.siteName || 'Stars777'
  const seo = settings?.seo || {}
  const canonicalBase = resolveCanonicalBase(seo.canonicalUrl)
  const canonical = new URL(pathname, canonicalBase).toString()
  const fallbackTitle = seo.title || `${siteName} - Online Gaming Platform`
  const detailSeo = buildDetailSeo(pathname, detail)
  const pageTitle = detailSeo.title || (pageSeo.title ? `${pageSeo.title} | ${siteName}` : fallbackTitle)

  return {
    title: pageTitle,
    description:
      detailSeo.description ||
      pageSeo.description ||
      seo.description ||
      'Stars777 online gaming platform with games, support, and fast access.',
    keywords: joinKeywords(detailSeo.keywords, pageSeo.keywords, seo.keywords),
    robots: 'index,follow,max-image-preview:large',
    canonical,
    siteName,
    ogImageUrl: detailSeo.ogImageUrl || seo.ogImageUrl || `${window.location.origin}/Stars777-Logo.png`,
    ogImageAlt: detailSeo.ogImageAlt || `${siteName} brand image`,
  }
}

function resolveCanonicalBase(configuredCanonicalUrl) {
  const requestOrigin = window.location.origin
  const requestHost = window.location.hostname

  if (!configuredCanonicalUrl) {
    return requestOrigin
  }

  try {
    const configuredUrl = new URL(configuredCanonicalUrl)

    if (!isLocalHostName(requestHost) && configuredUrl.hostname !== requestHost) {
      return requestOrigin
    }

    return configuredUrl.origin
  } catch {
    return requestOrigin
  }
}

function isLocalHostName(hostname) {
  const normalized = String(hostname || '').trim().toLowerCase()
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1'
}

function getPageSeo(pathname) {
  if (pathname === '/') {
    return {
      title: 'Online Gaming Platform',
      description:
        'Explore Stars777 for fair gameplay, fast withdrawals, featured game reviews, blog updates, and trusted support.',
      keywords: 'Stars777 home, online gaming platform, featured game reviews, fast withdrawals',
    }
  }

  if (pathname === '/games') {
    return {
      title: 'All Games',
      description:
        'Browse all published Stars777 games, genres, and reviews before you play.',
      keywords: 'Stars777 games, online games India, game reviews, casino games',
    }
  }

  if (pathname.startsWith('/games/')) {
    return {
      title: 'Game Review',
      description:
        'Read game details, genre information, and recent related updates on Stars777.',
      keywords: 'Stars777 game review, game details, genre review',
    }
  }

  if (pathname === '/blog') {
    return {
      title: 'Blog',
      description:
        'Read Stars777 blog posts, updates, player guides, and platform news.',
      keywords: 'Stars777 blog, player guides, gaming news, platform updates',
    }
  }

  if (pathname.startsWith('/blog/')) {
    return {
      title: 'Blog Post',
      description:
        'Read detailed Stars777 blog content, related posts, and category updates.',
      keywords: 'Stars777 article, blog detail, gaming article',
    }
  }

  if (pathname === '/contact') {
    return {
      title: 'Contact',
      description:
        'Contact Stars777 support for help with payments, gameplay, or account questions.',
      keywords: 'Stars777 contact, support, customer help, gaming support',
    }
  }

  if (pathname === '/faq') {
    return {
      title: 'Frequently Asked Questions',
      description:
        'Find answers to common Stars777 questions about gameplay, support, and account access.',
      keywords: 'Stars777 FAQ, help center, common questions, support answers',
    }
  }

  if (pathname === '/terms-of-service') {
    return {
      title: 'Terms of Service',
      description:
        'Read the Stars777 Terms of Service, account responsibilities, prohibited conduct, and legal conditions of use.',
      keywords: 'Stars777 terms of service, terms and conditions, legal terms, user agreement',
    }
  }

  if (pathname === '/privacy-policy') {
    return {
      title: 'Privacy Policy',
      description:
        'Read how Stars777 handles account, device, contact, and support information across the platform.',
      keywords: 'Stars777 privacy policy, data protection, privacy notice, user privacy',
    }
  }

  return {
    title: '',
    description: '',
    keywords: '',
  }
}

async function fetchDetailSeoResource(publicApiBase, pathname) {
  if (pathname.startsWith('/games/')) {
    const slug = pathname.slice('/games/'.length)
    return fetch(`${publicApiBase}/games/${slug}`)
  }

  if (pathname.startsWith('/blog/')) {
    const slug = pathname.slice('/blog/'.length)
    return fetch(`${publicApiBase}/blog-posts/${slug}`)
  }

  return null
}

function buildDetailSeo(pathname, detail) {
  if (!detail) {
    return {
      title: '',
      description: '',
      keywords: '',
      ogImageUrl: '',
      ogImageAlt: '',
    }
  }

  if (pathname.startsWith('/games/')) {
    return {
      title: `${detail.title} Review | Stars777`,
      description: buildExcerpt(detail.writeUp || detail.description, 160),
      keywords: `${detail.title}, ${detail.genre || 'game'} review, Stars777 ${detail.title}`,
      ogImageUrl: detail.imageUrl || '',
      ogImageAlt: detail.title || '',
    }
  }

  if (pathname.startsWith('/blog/')) {
    return {
      title: `${detail.title} | Stars777`,
      description: buildExcerpt(detail.writeUp || detail.description, 160),
      keywords: `${detail.title}, ${detail.category || 'blog'}, Stars777 blog`,
      ogImageUrl: detail.imageUrl || '',
      ogImageAlt: detail.title || '',
    }
  }

  return {
    title: '',
    description: '',
    keywords: '',
    ogImageUrl: '',
    ogImageAlt: '',
  }
}

function buildExcerpt(value, maxLength = 160) {
  const text = String(value || '')
    .replace(/!\[(.*?)\]\((.+?)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) {
    return 'Discover the latest updates from the Stars777 team.'
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

function joinKeywords(pageKeywords, globalKeywords) {
  return [pageKeywords, globalKeywords]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ')
}

function setMeta(name, content) {
  const element = getMetaElement('name', name)
  element.setAttribute('content', content)
}

function setMetaProperty(property, content) {
  const element = getMetaElement('property', property)
  element.setAttribute('content', content)
}

function getMetaElement(attribute, value) {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
  }

  return element
}

function setCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export default SeoManager
