import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'
import { getBlogExcerptText, parseBlogContentBlocks, parseInlineMarkdown } from '../utils/blogContent'

function BlogDetailPage() {
  const { slug } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [post, setPost] = useState(null)
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )
  const relatedPosts = useMemo(() => {
    if (!post) {
      return []
    }

    const currentCategory = String(post.category || '').toLowerCase()
    const sameCategory = recentPosts.filter(
      (entry) => String(entry.category || '').toLowerCase() === currentCategory,
    )
    const otherPosts = recentPosts.filter(
      (entry) => String(entry.category || '').toLowerCase() !== currentCategory,
    )

    return [...sameCategory, ...otherPosts].slice(0, 3)
  }, [post, recentPosts])
  const sidebarPosts = useMemo(() => recentPosts.slice(0, 5), [recentPosts])

  useEffect(() => {
    const fetchPostAndRecent = async () => {
      setLoading(true)
      setError('')

      try {
        const [postResponse, postsResponse] = await Promise.all([
          fetch(`${publicApiBase}/blog-posts/${slug}`),
          fetch(`${publicApiBase}/blog-posts`),
        ])

        if (!postResponse.ok) {
          throw new Error('post_not_found')
        }

        const [postResult, postsResult] = await Promise.all([
          postResponse.json(),
          postsResponse.ok ? postsResponse.json() : Promise.resolve([]),
        ])

        const list = Array.isArray(postsResult) ? postsResult : []

        setPost(postResult)
        setRecentPosts(list.filter((entry) => entry.slug !== postResult.slug))
      } catch {
        setPost(null)
        setRecentPosts([])
        setError('Blog post could not be found.')
      } finally {
        setLoading(false)
      }
    }

    fetchPostAndRecent()
  }, [publicApiBase, slug])

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
          <Link to="/blog" className="game-detail-back-link">
            Back to All Posts
          </Link>

          {loading ? <p className="lead-copy">Loading blog post...</p> : null}
          {error ? <p className="lead-copy">{error}</p> : null}

          {!loading && !error && post ? (
            <div className="game-review-layout">
              <article className="game-review-main">
                <h2>{post.title}</h2>

                <div className="game-review-content">
                  {formatBody(post).map((block, index) => (
                    block.type === 'image' ? (
                      <figure key={`${post.slug || post.id}-image-${index}`} className="blog-body-media">
                        <img
                          src={block.src}
                          alt={block.alt}
                          className="blog-body-image"
                          loading="lazy"
                          decoding="async"
                        />
                      </figure>
                    ) : block.type === 'heading' ? (
                      <h3 key={`${post.slug || post.id}-heading-${index}`} className="blog-body-heading">
                        {block.text}
                      </h3>
                    ) : block.type === 'centered' ? (
                      <p key={`${post.slug || post.id}-centered-${index}`} className="blog-body-centered">
                        {renderInlineContent(block.text, `${post.slug || post.id}-centered-${index}`)}
                      </p>
                    ) : (
                      <p key={`${post.slug || post.id}-paragraph-${index}`} className="game-detail-writeup">
                        {renderInlineContent(block.text, `${post.slug || post.id}-paragraph-${index}`)}
                      </p>
                    )
                  ))}
                </div>

                {relatedPosts.length > 0 ? (
                  <section className="related-posts-section">
                    <h3>Related Posts</h3>
                    <div className="related-posts-grid">
                      {relatedPosts.map((entry) => (
                        <Link to={`/blog/${entry.slug}`} className="public-game-card-link" key={entry.id}>
                          <article className="public-blog-card related-post-card">
                            {entry.imageUrl ? (
                              <img src={entry.imageUrl} alt={entry.title} className="public-blog-image" loading="lazy" decoding="async" />
                            ) : (
                              <div className="public-blog-image public-blog-image--placeholder">
                                {entry.category || 'Blog'}
                              </div>
                            )}

                            <div className="public-blog-content">
                              <span className="public-blog-category">{entry.category || 'General'}</span>
                              <h3>{entry.title}</h3>
                              <p>{getBlogExcerpt(entry.writeUp || entry.description || entry.title)}</p>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </article>

              <aside className="game-review-side">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.title} className="game-detail-image" decoding="async" fetchPriority="high" />
                ) : (
                  <div className="game-detail-image game-detail-image--placeholder">{post.category || 'Blog'}</div>
                )}

                <dl className="game-review-stats">
                  <div>
                    <dt>Author</dt>
                    <dd>{post.author || 'Admin Team'}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{post.category || 'General'}</dd>
                  </div>
                  <div>
                    <dt>Published</dt>
                    <dd>{formatPublicDate(post.publishedAt || post.updatedAt)}</dd>
                  </div>
                </dl>

                <h4>Recent Posts</h4>
                <ul className="recent-posts-list">
                  {sidebarPosts.map((entry) => (
                    <li key={entry.id} className="recent-post-item">
                      <Link to={`/blog/${entry.slug}`}>{entry.title}</Link>
                      <span>{entry.category}</span>
                    </li>
                  ))}
                  {sidebarPosts.length === 0 ? (
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

export default BlogDetailPage

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

function formatBody(post) {
  return parseBlogContentBlocks(post.writeUp || post.description, [
      `${post.title} is one of the latest updates from Stars777.`,
      'More long-form content for this post can be managed from the admin blog panel.',
    ])
}

function getBlogExcerpt(content) {
  return getBlogExcerptText(content)
}

function renderInlineContent(text, keyPrefix) {
  return parseInlineMarkdown(text).map((token, index) => {
    const key = `${keyPrefix}-inline-${index}`

    if (token.type === 'bold') {
      return <strong key={key}>{token.text}</strong>
    }

    if (token.type === 'link') {
      const isExternal = /^https?:\/\//i.test(token.href)

      return (
        <a
          key={key}
          href={token.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {token.text}
        </a>
      )
    }

    return <span key={key}>{token.text}</span>
  })
}
