import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'

function PrivacyPolicyPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [privacyPage, setPrivacyPage] = useState(defaultPrivacyPage)
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

    const fetchPrivacyPage = async () => {
      try {
        const response = await fetch(`${publicApiBase}/site-settings`)

        if (!response.ok) {
          return
        }

        const settings = await response.json()
        if (isMounted && settings?.privacyPage) {
          setPrivacyPage({ ...defaultPrivacyPage, ...settings.privacyPage })
        }
      } catch {
        // Keep built-in legal copy if settings cannot load.
      }
    }

    fetchPrivacyPage()

    return () => {
      isMounted = false
    }
  }, [publicApiBase])

  const paragraphs = String(privacyPage.body || '')
    .split(/\n\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  const introParagraph = paragraphs[0] || ''
  const sections = paragraphs.slice(1).map((entry, index) => {
    const [firstLine, ...restLines] = entry.split('\n')
    const hasSectionHeading = /^\d+\./.test(firstLine.trim())

    return {
      id: `privacy-section-${index}`,
      heading: hasSectionHeading ? firstLine.trim() : '',
      body: hasSectionHeading ? restLines.join('\n').trim() : entry,
    }
  })

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
        <section className="section-block legal-page-section">
          <h2>{privacyPage.title}</h2>
          <p className="legal-page-intro">{introParagraph}</p>
          <div className="legal-page-grid">
            {sections.map((section) => (
              <article className="legal-page-card" key={section.id}>
                {section.heading ? <h3>{section.heading}</h3> : null}
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

const defaultPrivacyPage = {
  title: 'Privacy Policy',
  body: [
    'This Privacy Policy explains how Stars777 handles information you share with us when you browse the website, contact support, submit forms, or use platform features.',
    '1. Information We Collect\n\nWe may collect contact details, messages you send through forms, support conversations, device and browser information, and general usage data needed to operate, secure, and improve the platform.',
    '2. How We Use Information\n\nStars777 uses this information to respond to support requests, maintain the website, analyze performance, prevent abuse, deliver service updates, and improve the overall player experience.',
    '3. Cookies And Analytics\n\nThe website may use cookies or similar technologies to remember preferences, understand traffic patterns, and measure feature usage. These tools help us keep the service stable and easier to use.',
    '4. Sharing And Disclosure\n\nWe do not sell personal information. Data may be shared only with service providers, hosting partners, analytics providers, or legal authorities when operationally necessary or legally required.',
    '5. Data Security\n\nWe use reasonable administrative and technical safeguards to protect stored information, but no online system can guarantee absolute security. You should also protect your own devices and credentials.',
    '6. Your Choices\n\nYou can limit what information you submit, request updates to incorrect details, or contact support if you want information removed where applicable. Operational or legal retention requirements may still apply.',
    '7. Policy Updates\n\nThis policy may be updated from time to time. Continued use of the website after changes are published means the revised policy applies from the posted effective date.',
  ].join('\n\n'),
}

export default PrivacyPolicyPage