import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'


function PromotionsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const menuItems = [
    { id: 'promotions', label: 'Promotions', href: '/promotions' },
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

  const publicApiBase = import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api'

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${publicApiBase}/promotions`)

        if (!response.ok) {
          throw new Error('promotions_fetch_failed')
        }

        const data = await response.json()
        setPromotions(Array.isArray(data) ? data : [])
      } catch {
        setPromotions([])
        setError('Promotions are temporarily unavailable.')
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [publicApiBase])

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
        <section id="promotions" className="section-block promotion-page-section">
          <h2>Promotions</h2>
          <p className="lead-copy">
            Current campaigns, bonus drops, and featured events available in the Stars777 experience.
          </p>
          <p className="lead-copy">
            Explore weekly offers, fast cash bonuses, seasonal reward campaigns, and exclusive member-only deals designed for Indian players who want more value from every session.
          </p>
          <p className="lead-copy">
            Every promotion is built to be simple, transparent, and rewarding, with quick access to terms, easy participation, and faster withdrawals through trusted payment methods.
          </p>

          {/* Promotion cards will render below if promotions exist */}
          <div className="promotion-cards" style={{ marginTop: '1.2rem' }}>
            {loading ? (
              <p className="lead-copy">Loading promotions...</p>
            ) : error ? (
              <p className="lead-copy">{error}</p>
            ) : (
              promotions.length > 0 ? (
                promotions.map((promotion, idx) => (
                  <article
                    className="promotion-card"
                    key={promotion.id}
                  >
                    <span className="promotion-step-circle">{idx + 1}</span>
                    <h3>{promotion.title}</h3>
                    <p>{promotion.writeUp}</p>
                  </article>
                ))
              ) : (
                <p className="lead-copy">No promotions published yet.</p>
              )
            )}
          </div>
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

export default PromotionsPage
