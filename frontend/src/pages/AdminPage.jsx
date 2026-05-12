import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import DashboardSection from '../components/DashboardSection'
import GamesSection from '../components/GamesSection'
import PostsBlogsSection from '../components/PostsBlogsSection'
import ReviewsSection from '../components/ReviewsSection'
import FaqSection from '../components/FaqSection'
import JackpotSettingsSection from '../components/JackpotSettingsSection'
import PopupCampaignSettingsSection from '../components/PopupCampaignSettingsSection'
import ContactSettingsSection from '../components/ContactSettingsSection'
import GlobalSettingsSection from '../components/GlobalSettingsSection'
import RummySectionSettingsSection from '../components/RummySectionSettingsSection'
import SeoSettingsSection from '../components/SeoSettingsSection'
import ContactMessagesSection from '../components/ContactMessagesSection'
import TermsConditionsSection from '../components/TermsConditionsSection'
import useWebsiteData from '../hooks/useWebsiteData'

function AdminPage() {
  const location = useLocation()
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [navigationGroups, setNavigationGroups] = useState([])
  const [navError, setNavError] = useState('')
  const [healthStatus, setHealthStatus] = useState({
    tone: 'checking',
    label: 'Checking backend',
  })
  const [adminTheme, setAdminTheme] = useState(
    () => localStorage.getItem('admin_theme') || 'light',
  )
  const {
    loading,
    error,
    unauthorized,
    data,
    createGame,
    updateGame,
    deleteGame,
    bulkUpdateGames,
    uploadBlogImage,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    bulkUpdateBlogPosts,
    createReview,
    updateReview,
    deleteReview,
    bulkUpdateReviews,
    createFaq,
    updateFaq,
    deleteFaq,
    bulkUpdateFaqs,
    updateSiteSettings,
    updateSeoSettings,
  } = useWebsiteData(token)
  const adminApiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || '/api/admin',
    [],
  )
  const activePanel = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    const requestedPanel = pathParts[1] || 'dashboard'
    const allowedPanels = new Set([
      'dashboard',
      'games',
      'blog-posts',
      'reviews',
      'faqs',
      'contact-messages',
      'jackpot',
      'popups',
      'rummy-section',
      'contact-page',
      'terms-conditions',
      'seo',
      'site-settings',
    ])

    return allowedPanels.has(requestedPanel) ? requestedPanel : 'dashboard'
  }, [location.pathname])
  const latestLogin = data.dashboard?.adminLogins?.recent?.[0]

  const handleThemeChange = (theme) => {
    localStorage.setItem('admin_theme', theme)
    setAdminTheme(theme)
  }

  const clearAdminSession = (message = '') => {
    localStorage.removeItem('admin_token')
    setToken('')
    setUsername('')
    setPassword('')
    setAuthError(message)
    setNavigationGroups([])
    setNavError('')
  }

  useEffect(() => {
    if (!unauthorized) {
      return
    }

    clearAdminSession('Your admin session expired. Please sign in again with the correct credentials.')
  }, [unauthorized])

  useEffect(() => {
    let cancelled = false

    const checkBackendHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (!response.ok) {
          throw new Error('health_error')
        }

        if (!cancelled) {
          setHealthStatus({ tone: 'online', label: 'Backend online' })
        }
      } catch {
        if (!cancelled) {
          setHealthStatus({ tone: 'offline', label: 'Backend offline' })
        }
      }
    }

    checkBackendHealth()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchNavigation = async () => {
      try {
        const response = await fetch(`${adminApiBase}/navigation`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('navigation_error')
        }

        const result = await response.json()
        setNavigationGroups(result)
        setNavError('')
      } catch {
        setNavigationGroups(defaultNavigationGroups)
        setNavError('')
      }
    }

    fetchNavigation()
  }, [adminApiBase, token])

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const response = await fetch(`${adminApiBase}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        setAuthError('Invalid username or password.')
        return
      }

      const result = await response.json()
      localStorage.setItem('admin_token', result.token)
      setToken(result.token)
      setPassword('')
    } catch {
      setAuthError('Unable to reach backend login endpoint.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    clearAdminSession('')
  }

  const renderActivePanel = () => {
    if (activePanel === 'dashboard') {
      return <DashboardSection dashboard={data.dashboard} loading={loading} error={error} />
    }

    if (loading) {
      return (
        <section className="section-block">
          <h2>Loading...</h2>
          <p className="lead-copy">Fetching admin panel data.</p>
        </section>
      )
    }

    if (error) {
      return (
        <section className="section-block">
          <h2>Data Error</h2>
          <p className="lead-copy">{error}</p>
        </section>
      )
    }

    if (activePanel === 'games') {
      return (
        <GamesSection
          games={data.games}
          onCreateGame={createGame}
          onUpdateGame={updateGame}
          onDeleteGame={deleteGame}
          onBulkAction={bulkUpdateGames}
        />
      )
    }

    if (activePanel === 'blog-posts') {
      return (
        <PostsBlogsSection
          postsBlogs={data.blogPosts}
          onUploadImage={uploadBlogImage}
          onCreatePost={createBlogPost}
          onUpdatePost={updateBlogPost}
          onDeletePost={deleteBlogPost}
          onBulkAction={bulkUpdateBlogPosts}
        />
      )
    }


    if (activePanel === 'reviews') {
      return (
        <ReviewsSection
          reviews={data.reviews}
          onCreateReview={createReview}
          onUpdateReview={updateReview}
          onDeleteReview={deleteReview}
          onBulkAction={bulkUpdateReviews}
        />
      )
    }

    if (activePanel === 'faqs') {
      return (
        <FaqSection
          faqs={data.faqs}
          onCreateFaq={createFaq}
          onUpdateFaq={updateFaq}
          onDeleteFaq={deleteFaq}
          onBulkAction={bulkUpdateFaqs}
        />
      )
    }

    if (activePanel === 'contact-messages') {
      return <ContactMessagesSection submissions={data.contactSubmissions} />
    }

    if (activePanel === 'jackpot') {
      return (
        <JackpotSettingsSection
          key={JSON.stringify(data.siteSettings?.jackpotSection || {})}
          siteSettings={data.siteSettings}
          onUpdateSettings={updateSiteSettings}
        />
      )
    }

    if (activePanel === 'popups') {
      return (
        <PopupCampaignSettingsSection
          key={JSON.stringify(data.siteSettings?.popupCampaign || {})}
          siteSettings={data.siteSettings}
          onUpdateSettings={updateSiteSettings}
        />
      )
    }

    if (activePanel === 'rummy-section') {
      return (
        <RummySectionSettingsSection
          key={JSON.stringify(data.siteSettings?.homepageFaqSection || {})}
          siteSettings={data.siteSettings}
          onUpdateSettings={updateSiteSettings}
        />
      )
    }

    if (activePanel === 'contact-page') {
      return (
        <ContactSettingsSection
          key={JSON.stringify(data.siteSettings?.contactPage || {})}
          siteSettings={data.siteSettings}
          onUpdateSettings={updateSiteSettings}
        />
      )
    }

    if (activePanel === 'terms-conditions') {
      return (
        <TermsConditionsSection
          key={JSON.stringify({
            termsPage: data.siteSettings?.termsPage || {},
            privacyPage: data.siteSettings?.privacyPage || {},
          })}
          termsPage={data.siteSettings?.termsPage}
          privacyPage={data.siteSettings?.privacyPage}
          onUpdateTerms={updateSiteSettings}
        />
      )
    }

    if (activePanel === 'seo') {
      return (
        <SeoSettingsSection
          key={JSON.stringify(data.seo || {})}
          seo={data.seo}
          onUpdateSeo={updateSeoSettings}
        />
      )
    }

    return (
      <GlobalSettingsSection
        key={JSON.stringify(data.siteSettings || {})}
        siteSettings={data.siteSettings}
        onUpdateSettings={updateSiteSettings}
      />
    )
  }

  if (!token) {
    return (
      <div className="admin-login-shell">
        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <img className="admin-login-logo" src="/Stars777-Logo.png" alt="Stars777" />
          <div className="admin-login-copy">
            <h1 id="admin-login-title">Admin Panel</h1>
            <div className={`admin-login-health admin-login-health--${healthStatus.tone}`}>
              <span className="admin-login-health__dot" aria-hidden="true" />
              <span>{healthStatus.label}</span>
            </div>
          </div>

          <form className="auth-form admin-login-form" onSubmit={handleLogin}>
            <label htmlFor="username">
              <span>Username</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label htmlFor="password">
              <span>Password</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {authError ? <div className="status error">{authError}</div> : null}

            <button type="submit" className="auth-button admin-login-button" disabled={authLoading}>
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className={`admin-shell admin-shell--${adminTheme}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <p className="admin-sidebar-title">Admin</p>
          <div className="admin-theme-switch" aria-label="Admin theme">
            <button
              type="button"
              className={adminTheme === 'light' ? 'active' : ''}
              onClick={() => handleThemeChange('light')}
            >
              Light
            </button>
            <button
              type="button"
              className={adminTheme === 'dark' ? 'active' : ''}
              onClick={() => handleThemeChange('dark')}
            >
              Dark
            </button>
          </div>
        </div>
        {navigationGroups.map((group) => (
          <div key={group.group} className="admin-group">
            <p className="admin-group-title">{group.group}</p>
            <nav className="admin-group-nav">
              {group.items.map((item) => {
                return (
                  <NavLink key={item.id} to={item.path}>
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        ))}
        <div className="admin-session-card">
          <span>Logged In</span>
          <strong>{latestLogin?.username || 'Admin'}</strong>
          <p>{latestLogin?.location || 'Location loading...'}</p>
          <small>{formatAdminDateTime(latestLogin?.loggedAt)}</small>
        </div>
        {navError ? <div className="status error">{navError}</div> : null}
        <button type="button" className="auth-button" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      <div className="admin-content">
        <main>
          {renderActivePanel()}
        </main>
      </div>
    </div>
  )
}

function formatAdminDateTime(value) {
  if (!value) {
    return 'Current session'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default AdminPage

const defaultNavigationGroups = [
  {
    group: 'menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
      { id: 'games', label: 'Games', path: '/admin/games' },
      { id: 'blog-posts', label: 'Blog Posts', path: '/admin/blog-posts' },
      { id: 'reviews', label: 'Reviews', path: '/admin/reviews' },
      { id: 'faqs', label: 'FAQ', path: '/admin/faqs' },
      { id: 'contact-messages', label: 'Messages', path: '/admin/contact-messages' },
    ],
  },
  {
    group: 'configuration',
    items: [
      { id: 'jackpot', label: 'Jackpot', path: '/admin/jackpot' },
      { id: 'popups', label: 'Popups', path: '/admin/popups' },
      { id: 'rummy-section', label: 'Rummy Section', path: '/admin/rummy-section' },
      { id: 'contact-page', label: 'Contact Page', path: '/admin/contact-page' },
      { id: 'terms-conditions', label: 'Terms & Conditions', path: '/admin/terms-conditions' },
      { id: 'seo', label: 'SEO', path: '/admin/seo' },
      { id: 'site-settings', label: 'Site Settings', path: '/admin/site-settings' },
    ],
  },
]
