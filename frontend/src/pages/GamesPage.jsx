import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'

function GamesPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [publicGames, setPublicGames] = useState([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [gamesError, setGamesError] = useState('')

  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    const fetchPublicGames = async () => {
      setGamesLoading(true)
      setGamesError('')

      try {
        const response = await fetch(`${publicApiBase}/games`)
        if (!response.ok) {
          throw new Error('games_fetch_failed')
        }

        const result = await response.json()
        setPublicGames(Array.isArray(result) ? result : [])
      } catch {
        setGamesError('Games are temporarily unavailable right now.')
      } finally {
        setGamesLoading(false)
      }
    }

    fetchPublicGames()
  }, [publicApiBase])

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
        <section id="all-games" className="section-block public-games-section">
          <h2>All Games</h2>
          <p className="lead-copy">All published games added from Stars777 admin panel.</p>

          {gamesLoading ? <p className="lead-copy">Loading games...</p> : null}
          {gamesError ? <p className="lead-copy">{gamesError}</p> : null}

          {!gamesLoading && !gamesError ? (
            <div className="public-games-grid">
              {publicGames.map((game) => (
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

              {publicGames.length === 0 ? <p className="lead-copy">No published games yet.</p> : null}
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

export default GamesPage
