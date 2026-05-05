import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'

function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaqId, setOpenFaqId] = useState(null)
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings)
  const [faqs, setFaqs] = useState([])
  const [faqLoading, setFaqLoading] = useState(true)
  const [faqError, setFaqError] = useState('')
  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )
  const menuItems = [
    { id: 'about-us', label: 'About', href: '/#about-us' },
    { id: 'big-agent-plan', label: 'Big Agent Plan', href: 'https://agents.stars777.org/' },
    { id: 'contact', label: 'Contact', href: '/contact' },
    {
      id: 'questions',
      label: 'Questions',
      dropdown: true,
      items: [
        { id: 'how-to-play', label: 'How to Play', href: '/#how-to-play' },
        { id: 'blog', label: 'Blog', href: '/blog' },
        { id: 'faq', label: 'FAQ', href: '/#faq' },
        { id: 'reviews', label: 'Reviews', href: '/#reviews' },
      ],
    },
  ]

  useEffect(() => {
    let isMounted = true

    const fetchContactPage = async () => {
      setFaqLoading(true)
      setFaqError('')

      try {
        const [settingsResponse, faqsResponse] = await Promise.all([
          fetch(`${publicApiBase}/site-settings`),
          fetch(`${publicApiBase}/faqs`),
        ])

        if (settingsResponse.ok) {
          const settings = await settingsResponse.json()

          if (isMounted) {
            setSiteSettings({
              ...defaultSiteSettings,
              ...settings,
              contactPage: {
                ...defaultContactPage,
                ...(settings?.contactPage || {}),
              },
            })
          }
        }

        if (!faqsResponse.ok) {
          throw new Error('faq_fetch_failed')
        }

        const faqResult = await faqsResponse.json()
        if (isMounted) {
          setFaqs(Array.isArray(faqResult) ? faqResult : [])
        }
      } catch {
        if (isMounted) {
          setFaqError('FAQ items are temporarily unavailable right now.')
          setFaqs([])
        }
      } finally {
        if (isMounted) {
          setFaqLoading(false)
        }
      }
    }

    fetchContactPage()

    return () => {
      isMounted = false
    }
  }, [publicApiBase])

  const contactPage = siteSettings.contactPage || defaultContactPage
  const visibleFaqs = faqs.slice(0, 5)
  const supportEmail =
    extractEmail(contactPage.emailText) ||
    siteSettings.supportEmail ||
    defaultSiteSettings.supportEmail
  const liveChatHref =
    resolveLiveChatHref(siteSettings.liveChatLink) ||
    (supportEmail ? `mailto:${supportEmail}` : '#contact')
  const callHref =
    resolvePhoneHref(contactPage.phoneText) ||
    (supportEmail ? `mailto:${supportEmail}` : '#contact')
  const emailCardContent = buildEmailCardContent(contactPage.emailText, supportEmail)

  const quickContactCards = [
    {
      id: 'live-chat',
      eyebrow: 'Instant Help',
      title: 'Live Chat',
      copy:
        contactPage.supportCopy ||
        'Our friendly support team is available during business hours for quick help.',
      detail: '',
      actionLabel: 'Chat Now',
      href: liveChatHref,
      imageUrl: contactPage.liveChatImageUrl,
      placeholder: 'Live Chat Image',
    },
    {
      id: 'email',
      eyebrow: 'Contact Us',
      title: 'E-Mail',
      copy: emailCardContent.copy,
      detail: emailCardContent.detail,
      actionLabel: 'Send E-Mail',
      href: supportEmail ? `mailto:${supportEmail}` : liveChatHref,
      imageUrl: contactPage.emailCardImageUrl,
      placeholder: 'E-Mail Image',
    },
    {
      id: 'callback',
      eyebrow: "Let's Talk",
      title: 'Call Back',
      copy:
        contactPage.salesCopy ||
        'Prefer a classic touch? Reach the team by phone and use the listed support hours for the best response time.',
      detail: '',
      actionLabel: 'Schedule a Call',
      href: callHref,
      imageUrl: contactPage.callbackCardImageUrl,
      placeholder: 'Call Back Image',
    },
  ]

  return (
    <div className="site-shell">
      <Header
        menuItems={menuItems}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        variant="public"
        actionButton={{ href: 'https://stars777.in/apk/7d4145943d5d4e0d9dc17ceb572ab567.apk', label: 'Download App' }}
      />

      <main>
        <section id="contact" className="section-block contact-section contact-page-section">
          <div className="contact-page-heading">
            <p className="contact-page-kicker">Contact Stars777 Online</p>
            <h2>{contactPage.title}</h2>
            {contactPage.intro ? <p className="lead-copy">{contactPage.intro}</p> : null}
          </div>

          <div className="contact-quick-grid">
            {quickContactCards.map((card) => {
              const external = isExternalHref(card.href)

              return (
                <article className={`contact-quick-card contact-quick-card--${card.id}`} key={card.id}>
                  <div className="contact-quick-card__content">
                    <p className="contact-quick-card__eyebrow">{card.eyebrow}</p>
                    <h3>{card.title}</h3>
                    <p className="contact-quick-card__copy">{card.copy}</p>
                    {card.detail ? <p className="contact-quick-card__meta">{card.detail}</p> : null}
                    <a
                      className="contact-quick-card__action"
                      href={card.href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noreferrer' : undefined}
                    >
                      {card.actionLabel}
                    </a>
                  </div>
                  <div className="contact-quick-card__visual" aria-hidden="true">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt="" className="contact-quick-card__image" loading="lazy" decoding="async" />
                    ) : (
                      <span className="contact-quick-card__placeholder">{card.placeholder}</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          <div className="contact-faq-layout">
            <div className="contact-faq-visual" aria-hidden="true">
              {contactPage.faqVisualImageUrl ? (
                <img src={contactPage.faqVisualImageUrl} alt="" className="contact-faq-image" loading="lazy" decoding="async" />
              ) : (
                <div className="contact-faq-placeholder">
                  <span>Add FAQ visual from backend</span>
                </div>
              )}
            </div>

            <div className="contact-faq-column">
              <h3 className="contact-faq-title">Frequently Asked Questions</h3>

              {faqLoading ? <p className="lead-copy">Loading FAQ items...</p> : null}
              {faqError ? <p className="lead-copy">{faqError}</p> : null}

              {!faqLoading && !faqError ? (
                <div className="faq-wrap contact-faq-wrap">
                  {visibleFaqs.map((item) => {
                    const isOpen = openFaqId === item.id

                    return (
                      <article key={item.id} className="faq-item">
                        <button
                          type="button"
                          className={`faq-trigger ${isOpen ? 'is-active' : ''}`}
                          aria-expanded={isOpen}
                          onClick={() => setOpenFaqId((current) => (current === item.id ? null : item.id))}
                        >
                          <span>{item.question}</span>
                          <span className={`faq-icon ${isOpen ? 'open' : ''}`}>v</span>
                        </button>

                        {isOpen ? <p className="faq-answer">{item.answer}</p> : null}
                      </article>
                    )
                  })}

                  {visibleFaqs.length === 0 ? <p className="lead-copy">No FAQ items published yet.</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

const defaultContactPage = {
  title: 'Contact Us',
  intro:
    'We are deeply committed to delivering unparalleled service and unwavering support to ensure your experience exceeds expectations.',
  address: '3680 Schamberger Pass, North Catarina 01894-8381',
  phoneText: '',
  emailText: "We're usually replying within 24 hours pagedone1234@gmail.com",
  workingHours: 'Mon To Sat - 10 am To 7 pm Sunday - 11am To 5 pm',
  pressCopy:
    'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
  supportCopy:
    'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
  salesCopy:
    'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
  liveChatImageUrl: '',
  emailCardImageUrl: '',
  callbackCardImageUrl: '',
  faqVisualImageUrl: '',
}

const defaultSiteSettings = {
  supportEmail: 'support@stars777.example',
  liveChatLink: 'https://wa.me/',
  contactPage: defaultContactPage,
}

function extractEmail(value) {
  const match = String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match ? match[0] : ''
}

function buildEmailCardContent(emailText, fallbackEmail) {
  const normalizedText = String(emailText || '').trim()
  const email = extractEmail(normalizedText) || fallbackEmail || ''

  if (!normalizedText) {
    return {
      copy: 'Send us an email at',
      detail: email || 'Add a support email in the backend settings.',
    }
  }

  const copyWithoutEmail = email
    ? normalizedText.replace(email, '').replace(/\s{2,}/g, ' ').trim()
    : normalizedText

  return {
    copy: copyWithoutEmail || 'Send us an email at',
    detail: email || '',
  }
}

function resolvePhoneHref(value) {
  const match = String(value || '').match(/\+?[\d][\d\s()-]{6,}[\d]/)
  if (!match) {
    return ''
  }

  const normalized = match[0].replace(/(?!^\+)\D/g, '')
  return normalized ? `tel:${normalized}` : ''
}

function resolveLiveChatHref(value) {
  const raw = String(value || '').trim()

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  const directChatMatch = raw.match(/https:\/\/www\.livechat\.com\/chat-with\/\d+\//i)
  if (directChatMatch) {
    return directChatMatch[0]
  }

  const licenseMatch = raw.match(/chat-with\/(\d+)\//i)
  if (licenseMatch) {
    return `https://www.livechat.com/chat-with/${licenseMatch[1]}/`
  }

  const match = raw.match(/https?:\/\/\S+/i)
  if (!match) {
    return ''
  }

  return /tracking\.js/i.test(match[0]) ? '' : match[0]
}

function isExternalHref(value) {
  return /^https?:\/\//i.test(String(value || ''))
}

export default ContactPage
