import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'

function TermsOfServicePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [termsPage, setTermsPage] = useState(defaultTermsPage)
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

    const fetchTermsPage = async () => {
      try {
        const response = await fetch(`${publicApiBase}/site-settings`)

        if (!response.ok) {
          return
        }

        const settings = await response.json()
        if (isMounted && settings?.termsPage) {
          setTermsPage({ ...defaultTermsPage, ...settings.termsPage })
        }
      } catch {
        // Keep built-in legal copy if settings cannot load.
      }
    }

    fetchTermsPage()

    return () => {
      isMounted = false
    }
  }, [publicApiBase])

  const paragraphs = String(termsPage.body || '')
    .split(/\n\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  const introParagraph = paragraphs[0] || ''
  const sections = paragraphs.slice(1).map((entry, index) => {
    const [firstLine, ...restLines] = entry.split('\n')
    const hasSectionHeading = /^\d+\./.test(firstLine.trim())

    return {
      id: `terms-section-${index}`,
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
          <h2>{termsPage.title}</h2>
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

const defaultTermsPage = {
  title: 'Terms of Service For Stars777',
  body: [
    'Welcome to Stars777! These Terms of Service ("Terms") govern your use of the Stars777 mobile application ("Application") and the services provided therein ("Services"), operated by Stars777 ("we", "us", "our").',
    '1. Acceptance of Terms\n\nBy downloading, installing, accessing, or using the Application or Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms or our Privacy Policy, please do not use the Application or Services.',
    '2. License\n\nSubject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Application solely for your personal, non-commercial purposes. You may not modify, distribute, reproduce, or create derivative works based on the Application.',
    '3. User Accounts\n\nYou may need to create an account to access certain features of the Application. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
    '4. Prohibited Conduct\n\nYou agree not to:\n- Use the Application or Services for any illegal or unauthorized purpose.\n- Modify, adapt, or hack the Application or modify another website so as to falsely imply that it is associated with the Application.\n- Attempt to gain unauthorized access to our servers or networks.\n- Interfere with or disrupt the integrity or performance of the Application or Services.',
    '5. Intellectual Property\n\nThe Application and all content and materials therein are owned by us or our licensors and are protected by intellectual property laws. You may not use our trademarks, logos, or other proprietary information without our express written permission.',
    '6. Stars777 Privacy\n\nYour use of the Application and Services is subject to our Privacy Policy. By using the Application or Services, you consent to the collection, use, and sharing of your information as described in the Privacy Policy.',
    '7. Termination\n\nWe may terminate or suspend your access to the Application or Services at any time, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.',
    '8. Disclaimer of Warranties\n\nThe Application and Services are provided on an "as is" and "as available" basis. We do not warrant that the Application will be uninterrupted, error-free, secure, or that any defects will be corrected.',
    '9. Limitation of Liability\n\nIn no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, arising out of or in connection with your use of the Application or Services.',
    '10. Stars777 Governing Law\n\nThese Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.',
    '11. Changes to Terms\n\nWe reserve the right to update or modify these Terms at any time without prior notice. We will post the updated Terms on the Application. Your continued use of the Application or Services after any such changes constitutes your acceptance of the new Terms.',
    '12. Contact Us\n\nIf you have any questions about these Terms, please contact us',
  ].join('\n\n'),
}

export default TermsOfServicePage