import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'
import { getBlogExcerptText } from '../utils/blogContent'

function BlogPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${publicApiBase}/blog-posts`)
        if (!response.ok) {
          throw new Error('blog_fetch_failed')
        }

        const result = await response.json()
        setBlogPosts(Array.isArray(result) ? result : [])
      } catch {
        setError('Blog posts are temporarily unavailable right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
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
        <section id="blog" className="section-block public-blog-section blog-page-section">
          <h2>Blog</h2>
          <p className="lead-copy">Latest Stars777 updates, player guides, and product notes from the team.</p>

          {loading ? <p className="lead-copy">Loading blog posts...</p> : null}
          {error ? <p className="lead-copy">{error}</p> : null}

          {!loading && !error ? (
            <div className="public-blog-grid">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="public-game-card-link">
                  <article className="public-blog-card">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="public-blog-image" loading="lazy" decoding="async" />
                    ) : (
                      <div className="public-blog-image public-blog-image--placeholder">
                        {post.category || 'Blog'}
                      </div>
                    )}

                    <div className="public-blog-content">
                      <span className="public-blog-category">{post.category || 'General'}</span>
                      <h3>{post.title}</h3>
                      <p>{getBlogExcerpt(post.writeUp || post.description || post.title)}</p>
                      <div className="public-blog-meta">
                        <span>By {post.author || 'Admin Team'}</span>
                        <span>{formatPublicDate(post.publishedAt || post.updatedAt)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}

              {blogPosts.length === 0 ? <p className="lead-copy">No published blog posts yet.</p> : null}
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

export default BlogPage

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
