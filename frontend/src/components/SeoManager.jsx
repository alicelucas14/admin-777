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
        const response = await fetch(`${publicApiBase}/site-settings`)

        if (!response.ok) {
          return
        }

        const settings = await response.json()
        if (!isMounted) {
          return
        }

        applySeo(buildSeoPayload({
          pathname: location.pathname,
          pageSeo,
          settings,
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

function buildSeoPayload({ pathname, pageSeo, settings }) {
  const siteName = settings?.siteName || 'Stars777'
  const seo = settings?.seo || {}
  const canonicalBase = seo.canonicalUrl || window.location.origin
  const canonical = new URL(pathname, canonicalBase).toString()
  const fallbackTitle = seo.title || `${siteName} - Online Gaming Platform`
  const pageTitle = pageSeo.title ? `${pageSeo.title} | ${siteName}` : fallbackTitle

  return {
    title: pageTitle,
    description:
      pageSeo.description ||
      seo.description ||
      'Stars777 online gaming platform with games, support, and fast access.',
    keywords: joinKeywords(pageSeo.keywords, seo.keywords),
    robots: 'index,follow,max-image-preview:large',
    canonical,
    siteName,
    ogImageUrl: seo.ogImageUrl || `${window.location.origin}/Stars777-Logo.png`,
    ogImageAlt: `${siteName} brand image`,
  }
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

  return {
    title: '',
    description: '',
    keywords: '',
  }
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
