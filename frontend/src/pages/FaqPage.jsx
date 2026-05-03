import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'

function FaqPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaqId, setOpenFaqId] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${publicApiBase}/faqs`)

        if (!response.ok) {
          throw new Error('faq_fetch_failed')
        }

        const result = await response.json()
        setFaqs(Array.isArray(result) ? result : [])
      } catch {
        setError('FAQ items are temporarily unavailable right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [publicApiBase])

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
        { id: 'faq', label: 'FAQ', href: '/faq' },
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
        <section id="faq" className="section-block faq-section faq-page-section">
          <h2>Frequently Asked Questions</h2>

          {loading ? <p className="lead-copy">Loading FAQ items...</p> : null}
          {error ? <p className="lead-copy">{error}</p> : null}

          {!loading && !error ? (
            <div className="faq-wrap">
              {faqs.map((item) => {
                const isOpen = openFaqId === item.id

                return (
                  <article key={item.id} className="faq-item">
                    <button
                      type="button"
                      className="faq-trigger"
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

              {faqs.length === 0 ? <p className="lead-copy">No FAQ items published yet.</p> : null}
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

export default FaqPage