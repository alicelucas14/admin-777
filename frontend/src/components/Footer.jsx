import { useEffect, useMemo, useState } from 'react'

function Footer() {
  const [siteSettings, setSiteSettings] = useState(null)
  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch(`${publicApiBase}/site-settings`)
        if (!response.ok) {
          return
        }

        const result = await response.json()
        setSiteSettings(result)
      } catch {
        setSiteSettings(null)
      }
    }

    fetchSiteSettings()
  }, [publicApiBase])

  const socialLinks = normalizeSocialLinks(siteSettings?.socialLinks)
  const withdrawalPartners = normalizeWithdrawalPartners(siteSettings?.withdrawalPartners)
  const siteName = siteSettings?.siteName || 'Stars777'
  const youtubeLink = socialLinks.find((item) => item.platform.toLowerCase() === 'youtube')
  const liveChatLink = String(siteSettings?.contactPage?.liveChatLink || '').trim()
  const liveChatHref = liveChatLink.startsWith('http') ? liveChatLink : ''

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <section className="footer-column footer-quicklinks">
          <h2>Quicklinks</h2>
          <nav>
            <a href="/">Home</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/sitemap">Sitemap</a>
            {liveChatHref ? (
              <a href={liveChatHref} target="_blank" rel="noopener noreferrer">
                Live Chat
              </a>
            ) : null}
          </nav>
          <a
            className="footer-youtube"
            href={youtubeLink?.url || '#'}
            target={youtubeLink?.url ? '_blank' : undefined}
            rel={youtubeLink?.url ? 'noopener noreferrer' : undefined}
          >
            <span>
              {youtubeLink?.iconUrl ? (
                <img src={youtubeLink.iconUrl} alt="" loading="lazy" decoding="async" />
              ) : (
                getSocialFallbackLabel('YouTube')
              )}
            </span>
            <strong>{siteName} Official YouTube Channel</strong>
          </a>
        </section>

        <section className="footer-column footer-social">
          <h2>Follow Us</h2>
          <div className="footer-social-row">
            {socialLinks
              .filter((item) => item.platform.toLowerCase() !== 'youtube')
              .map((item) => (
              <a
                key={item.id}
                href={item.url || '#'}
                target={item.url ? '_blank' : undefined}
                rel={item.url ? 'noopener noreferrer' : undefined}
                aria-label={item.platform}
              >
                {item.iconUrl ? (
                  <img src={item.iconUrl} alt="" loading="lazy" decoding="async" />
                ) : (
                  getSocialFallbackLabel(item.platform)
                )}
              </a>
              ))}
          </div>
          <p className="footer-disclaimer">
            <strong>DISCLAIMER</strong> - Services are not offered in Assam, Arunachal Pradesh,
            Andhra Pradesh, Telangana, Orissa, or Nagaland. Games suitable for players above the
            age of 18+.
          </p>
        </section>

        <section className="footer-column footer-security">
          <h2>Integrity Of Game And Security</h2>
          <div className="footer-badge-grid">
            {['No Bot', 'ISO Certified', 'Instant Withdrawal', "Nation's Trusted App"].map((item) => (
              <span className="footer-badge" key={item}>
                <i>{item.slice(0, 2).toUpperCase()}</i>
                {item}
              </span>
            ))}
          </div>
          <h2>Withdrawal Partners</h2>
          <div className="footer-partner-grid">
            {withdrawalPartners.map((partner) => {
              const content = partner.imageUrl ? (
                <img src={partner.imageUrl} alt={partner.name} loading="lazy" decoding="async" />
              ) : (
                partner.name
              )

              return partner.url ? (
                <a
                  className="footer-partner"
                  href={partner.url}
                  key={partner.id}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                <span className="footer-partner" key={partner.id}>
                  {content}
                </span>
              )
            })}
          </div>
        </section>
      </div>

      <div className="footer-copyright">Copyright C 2024 {siteName} | Powered by {siteName}</div>
    </footer>
  )
}

function normalizeSocialLinks(value) {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => ({
        id: String(item.id || `${item.platform || 'social'}-${index}`),
        platform: String(item.platform || '').trim(),
        url: String(item.url || '').trim(),
        iconUrl: String(item.iconUrl || '').trim(),
      }))
      .filter((item) => item.platform && item.url)
  }

  return Object.entries(value || {})
    .map(([platform, url]) => ({
      id: platform,
      platform,
      url: String(url || '').trim(),
      iconUrl: defaultSocialIcon(platform),
    }))
    .filter((item) => item.platform && item.url)
}

function normalizeWithdrawalPartners(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => ({
      id: String(item.id || `${item.name || 'partner'}-${index}`),
      name: String(item.name || '').trim(),
      url: String(item.url || '').trim(),
      imageUrl: String(item.imageUrl || '').trim(),
    }))
    .filter((item) => item.name)
}

function getSocialFallbackLabel(platform) {
  return String(platform || 'S').trim().slice(0, 2).toUpperCase()
}

function defaultSocialIcon(platform) {
  const key = String(platform || '').toLowerCase().trim()
  const iconMap = {
    facebook: 'https://cdn.simpleicons.org/facebook/white',
    twitter: 'https://cdn.simpleicons.org/x/white',
    x: 'https://cdn.simpleicons.org/x/white',
    instagram: 'https://cdn.simpleicons.org/instagram/white',
    telegram: 'https://cdn.simpleicons.org/telegram/white',
    youtube: 'https://cdn.simpleicons.org/youtube/white',
  }

  return iconMap[key] || ''
}

export default Footer
