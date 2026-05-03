import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ReviewCarousel from '../components/ReviewCarousel'
import LiveChatWidget from '../components/LiveChatWidget'
import HeroSection from '../components/HeroSection'
import { getBlogExcerptText } from '../utils/blogContent'

function FrontendPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaqId, setOpenFaqId] = useState(null)
  const [publicGames, setPublicGames] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [publicReviews, setPublicReviews] = useState([])
  const [publicFaqs, setPublicFaqs] = useState([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [gamesError, setGamesError] = useState('')

  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    const fetchPublicData = async () => {
      setGamesLoading(true)
      setGamesError('')

      try {
        const [gamesResponse, blogResponse, reviewsResponse, faqsResponse] = await Promise.all([
          fetch(`${publicApiBase}/games`),
          fetch(`${publicApiBase}/blog-posts`),
          fetch(`${publicApiBase}/reviews`),
          fetch(`${publicApiBase}/faqs`),
        ])

        if (!gamesResponse.ok || !blogResponse.ok || !reviewsResponse.ok || !faqsResponse.ok) {
          throw new Error('games_fetch_failed')
        }

        const [gamesResult, blogResult, reviewsResult, faqsResult] = await Promise.all([
          gamesResponse.json(),
          blogResponse.json(),
          reviewsResponse.json(),
          faqsResponse.json(),
        ])

        setPublicGames(Array.isArray(gamesResult) ? gamesResult : [])
        setBlogPosts(Array.isArray(blogResult) ? blogResult : [])
        setPublicReviews(Array.isArray(reviewsResult) ? reviewsResult : [])
        setPublicFaqs(Array.isArray(faqsResult) ? faqsResult : [])
      } catch {
        setBlogPosts([])
        setPublicReviews([])
        setPublicFaqs([])
        setGamesError('Games are temporarily unavailable right now.')
      } finally {
        setGamesLoading(false)
      }
    }

    fetchPublicData()
  }, [publicApiBase])

  const menuItems = [
    { id: 'about-us', label: 'About' },
    { id: 'big-agent-plan', label: 'Big Agent Plan', href: 'https://agents.stars777.org/' },
    { id: 'contact', label: 'Contact', href: '/contact' },
    {
      id: 'questions',
      label: 'Questions',
      dropdown: true,
      items: [
        { id: 'how-to-play', label: 'How to Play' },
        { id: 'blog', label: 'Blog', href: '/blog' },
        { id: 'faq', label: 'FAQ' },
        { id: 'reviews', label: 'Reviews' },
      ],
    },
  ]
  const featuredGames = publicGames.slice(0, 3)
  const featuredBlogPosts = blogPosts.slice(0, 3)
  const faqItems = publicFaqs
  const featuredFaqs = faqItems.slice(0, 3)
  return (
    <div className="site-shell">
      <Header
        menuItems={menuItems}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        variant="public"
        actionButton={{ href: 'https://stars777.in/apk/7d4145943d5d4e0d9dc17ceb572ab567.apk', label: 'Download App' }}
      />


      <HeroSection loading={gamesLoading} error={gamesError} />

      <main>
        <section id="about-us" className="section-block">
          <h2>About Us</h2>
          <div className="about-us-layout">
            <div className="about-us-copy">
              <p className="lead-copy">
                Stars777 is India&apos;s number one choice for player happiness and online interaction if you&apos;re interested in getting into online gaming. We place a high priority on quick withdrawals and provide advice on a variety of Indian lottery games and gaming alternatives, including Rummy, Teen Patti, casinos, lotteries, and more.
              </p>
              <p className="lead-copy">
                We have a wide selection of well-liked games on our platform, including skill-based games. As a data-science and analytics-focused gaming firm, we are dedicated to ongoing innovation to improve player experience and guarantee a safe and reliable environment.
              </p>
              <p className="lead-copy">
                What Makes Stars777 Different? - We are committed to creating a gaming environment that prioritizes fairness, transparency, and user protection. With thousands of active players across India, Stars777 continues to set the standard for responsible and customer-centric online gaming platforms.
              </p>
              <p className="lead-copy">
                Secure Payments &amp; Fast Withdrawals - All deposits and withdrawals are processed through trusted Indian payment channels, including UPI, bank transfers, and major digital wallets. Our withdrawal system is optimized for speed, ensuring that verified users receive their winnings quickly and securely.
              </p>
            </div>

            <div className="about-us-visual" aria-hidden="true">
              <img src="/about_side.png" alt="" className="about-us-image" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section id="games-showcase" className="section-block public-games-section">
          <h2>Featured Game Reviews</h2>
          <p className="lead-copy">Games to play in Stars777 with Family and Friend.</p>

           <p className="lead-copy">
            Transparent &amp; Fair Gameplay - Every game on Stars777 is powered by a Random Number Generator (RNG) that is regularly checked to ensure unpredictable and unbiased results. These systems are monitored by independent evaluators who help maintain the fairness and integrity of each game.
          </p>
          <p className="lead-copy">
            Support You Can Trust - Our dedicated support team is available to assist you anytime. Whether you need help with payments, gameplay, or account verification, we are here to guide you professionally and respectfully.
          </p>

          {gamesLoading ? <p className="lead-copy">Loading games...</p> : null}
          {gamesError ? <p className="lead-copy">{gamesError}</p> : null}

          {!gamesLoading && !gamesError ? (
            <div className="public-games-grid">
              {featuredGames.map((game) => (
                <Link key={game.id} to={`/games/${game.slug}`} className="public-game-card-link">
                  <article className="public-game-card">
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt={game.title} className="public-game-image" loading="lazy" decoding="async" />
                    ) : (
                      <div className="public-game-image public-game-image--placeholder">
                        {game.title}
                      </div>
                    )}
                    <h3>{game.title}</h3>
                    <p className="public-game-genre">{game.genre}</p>
                    {game.writeUp || game.description ? (
                      <p className="public-game-description">{game.writeUp || game.description}</p>
                    ) : null}
                  </article>
                </Link>
              ))}
            </div>
          ) : null}

        </section>

        <section id="blog" className="section-block public-blog-section">
          <h2>Blog</h2>
          <p className="lead-copy">
            Latest Stars777 updates, player guides, and product notes from the team.
          </p>

          {!gamesLoading && !gamesError ? (
            <div className="public-blog-grid">
              {featuredBlogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="public-game-card-link">
                  <article className="public-blog-card">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="public-blog-image" loading="lazy" decoding="async" />
                    ) : (
                      <div className="public-blog-image public-blog-image--placeholder">
                        {post.title}
                      </div>
                    )}
                    <div className="public-blog-content">
                      <span className="public-blog-category">{post.category || 'General'}</span>
                      <h3>{post.title}</h3>
                      <p>{getBlogExcerpt(post.writeUp || post.description || post.title)}</p>
                      <div className="public-blog-meta">
                        <span>{post.author || 'Admin Team'}</span>
                        <span>{formatPublicDate(post.publishedAt || post.updatedAt)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}

              {featuredBlogPosts.length === 0 ? <p className="lead-copy">No blog posts yet.</p> : null}
            </div>
          ) : null}

          {blogPosts.length > 3 ? (
            <div className="public-games-actions">
              <Link to="/blog" className="public-games-view-all">
                View More
              </Link>
            </div>
          ) : null}
        </section>

        <section id="reviews" className="section-block">
          <h2>Reviews</h2>
          <p className="lead-copy">
            Players rate Stars777 highly for smooth performance, clear reward
            systems, and frequent event updates.
          </p>

          <ReviewCarousel reviews={publicReviews} />

          {publicReviews.length === 0 ? <p className="lead-copy">No reviews published yet.</p> : null}
        </section>

        <section id="faq" className="section-block faq-section">
          <h2>Frequently Asked Questions</h2>

          <div className="faq-wrap">
            {featuredFaqs.map((item) => {
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

            {faqItems.length === 0 ? <p className="lead-copy">No FAQ items published yet.</p> : null}
          </div>

          {faqItems.length > featuredFaqs.length ? (
            <div className="public-games-actions">
              <Link to="/faq" className="public-games-view-all">
                See More
              </Link>
            </div>
          ) : null}
        </section>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

function formatPublicDate(value) {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getBlogExcerpt(content) {
  return getBlogExcerptText(content)
}

export default FrontendPage
