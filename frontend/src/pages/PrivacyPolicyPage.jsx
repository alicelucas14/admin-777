import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'

function PrivacyPolicyPage() {
  const [menuOpen, setMenuOpen] = useState(false)

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
          <h2>Privacy Policy</h2>
          <p className="legal-page-intro">
            This Privacy Policy explains how Stars777 handles information you share with us when
            you browse the website, contact support, submit forms, or use platform features.
          </p>
          <div className="legal-page-grid">
            {privacySections.map((section) => (
              <article className="legal-page-card" key={section.title}>
                <h3>{section.title}</h3>
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

const privacySections = [
  {
    title: '1. Information We Collect',
    body:
      'We may collect contact details, messages you send through forms, support conversations, device and browser information, and general usage data needed to operate, secure, and improve the platform.',
  },
  {
    title: '2. How We Use Information',
    body:
      'Stars777 uses this information to respond to support requests, maintain the website, analyze performance, prevent abuse, deliver service updates, and improve the overall player experience.',
  },
  {
    title: '3. Cookies And Analytics',
    body:
      'The website may use cookies or similar technologies to remember preferences, understand traffic patterns, and measure feature usage. These tools help us keep the service stable and easier to use.',
  },
  {
    title: '4. Sharing And Disclosure',
    body:
      'We do not sell personal information. Data may be shared only with service providers, hosting partners, analytics providers, or legal authorities when operationally necessary or legally required.',
  },
  {
    title: '5. Data Security',
    body:
      'We use reasonable administrative and technical safeguards to protect stored information, but no online system can guarantee absolute security. You should also protect your own devices and credentials.',
  },
  {
    title: '6. Your Choices',
    body:
      'You can limit what information you submit, request updates to incorrect details, or contact support if you want information removed where applicable. Operational or legal retention requirements may still apply.',
  },
  {
    title: '7. Policy Updates',
    body:
      'This policy may be updated from time to time. Continued use of the website after changes are published means the revised policy applies from the posted effective date.',
  },
]

export default PrivacyPolicyPage