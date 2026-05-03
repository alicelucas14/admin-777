import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'

function GameDetailPage() {
  const { slug } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFailed, setImageFailed] = useState(false)
  const [recentPosts, setRecentPosts] = useState([])

  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    const fetchGameAndPosts = async () => {
      setLoading(true)
      setError('')

      try {
        const [gameResponse, postsResponse] = await Promise.all([
          fetch(`${publicApiBase}/games/${slug}`),
          fetch(`${publicApiBase}/blog-posts`),
        ])

        if (!gameResponse.ok) {
          throw new Error('game_not_found')
        }

        const [gameResult, postsResult] = await Promise.all([
          gameResponse.json(),
          postsResponse.ok ? postsResponse.json() : Promise.resolve([]),
        ])

        setGame(gameResult)
        setRecentPosts(Array.isArray(postsResult) ? postsResult.slice(0, 5) : [])
        setImageFailed(false)
      } catch {
        setGame(null)
        setRecentPosts([])
        setError('Game write-up could not be found.')
      } finally {
        setLoading(false)
      }
    }

    fetchGameAndPosts()
  }, [publicApiBase, slug])

  const menuItems = [
      // Removed promotions menu item
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
        <section className="section-block game-detail-section">
          <Link to="/games" className="game-detail-back-link">
            Back to All Games
          </Link>

          {loading ? <p className="lead-copy">Loading game details...</p> : null}
          {error ? <p className="lead-copy">{error}</p> : null}

          {!loading && !error && game ? (
            <div className="game-review-layout">
              <article className="game-review-main">
                <h2>{game.title}</h2>

                <div className="game-review-content">
                  {formatWriteUp(game.writeUp || game.description).map((paragraph, index) => (
                    <p key={`${game.slug || game.id}-paragraph-${index}`} className="game-detail-writeup">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>

              <aside className="game-review-side">
                {game.imageUrl && !imageFailed ? (
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="game-detail-image"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="game-detail-image game-detail-image--placeholder">{game.title}</div>
                )}

                <dl className="game-review-stats">
                  <div>
                    <dt>Game</dt>
                    <dd>{game.title}</dd>
                  </div>
                  <div>
                    <dt>Genre</dt>
                    <dd>{game.genre || 'General'}</dd>
                  </div>
                  <div>
                    <dt>Developer</dt>
                    <dd>In-house</dd>
                  </div>
                </dl>

                <h4>Recent Posts</h4>
                <ul className="recent-posts-list">
                  {recentPosts.map((post) => (
                    <li key={post.id} className="recent-post-item">
                      <strong>{post.title}</strong>
                      <span>{post.category}</span>
                    </li>
                  ))}
                  {recentPosts.length === 0 ? (
                    <li className="recent-post-item">No recent posts yet.</li>
                  ) : null}
                </ul>
              </aside>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

export default GameDetailPage

function formatWriteUp(value) {
  const text = String(value || '').trim()

  if (!text) {
    return ['No write-up yet.']
  }

  return text
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}
