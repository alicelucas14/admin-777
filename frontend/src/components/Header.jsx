import { useState } from 'react'
import { Link } from 'react-router-dom'

function Header({
  menuItems,
  menuOpen,
  setMenuOpen,
  actionLink,
  actionButton,
  variant = 'default',
}) {
  const isPublic = variant === 'public'
  const primaryMenuItems = menuItems.filter((item) => !item.dropdown)
  const dropdownMenu = menuItems.find((item) => item.dropdown)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const isExternalHref = (href) => /^https?:\/\//i.test(href)

  return (
    <header className={`site-header ${isPublic ? 'site-header--public' : ''}`}>
      <div className={`brand ${isPublic ? 'brand-public' : ''}`}>
        {isPublic ? (
          <a href="/" className="brand-home-link" onClick={() => setMenuOpen(false)}>
            <img src="/Stars777-Logo.png" alt="Stars777" className="brand-logo" decoding="async" fetchPriority="high" />
          </a>
        ) : (
          'Stars777'
        )}
      </div>
      <button
        type="button"
        className="menu-button"
        onClick={() => setMenuOpen((value) => !value)}
      >
        {isPublic ? (
          <img src="/nav.png" alt="Menu" className="menu-button-image" decoding="async" />
        ) : (
          'Menu'
        )}
      </button>
      {isPublic ? (
        <div className="public-nav-zone">
          <nav className={`main-nav main-nav--public ${menuOpen ? 'open' : ''}`}>
            {primaryMenuItems.map((item) => (
              <a
                key={item.id}
                href={item.href ?? `#${item.id}`}
                target={item.href && isExternalHref(item.href) ? '_blank' : undefined}
                rel={item.href && isExternalHref(item.href) ? 'noopener noreferrer' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {dropdownMenu ? (
              <div className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="nav-dropdown-trigger"
                  onClick={() => setDropdownOpen((value) => !value)}
                >
                  {dropdownMenu.label}
                </button>
                <div className="nav-dropdown-menu">
                  {dropdownMenu.items.map((item) => (
                    <a
                      key={item.id}
                      href={item.href ?? `#${item.id}`}
                      target={item.href && isExternalHref(item.href) ? '_blank' : undefined}
                      rel={item.href && isExternalHref(item.href) ? 'noopener noreferrer' : undefined}
                      onClick={() => {
                        setMenuOpen(false)
                        setDropdownOpen(false)
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            {actionButton ? (
              <a
                className="header-cta header-cta--mobile"
                href={actionButton.href}
                target={isExternalHref(actionButton.href) ? '_blank' : undefined}
                rel={isExternalHref(actionButton.href) ? 'noopener noreferrer' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {actionButton.label}
              </a>
            ) : null}
          </nav>
          {actionButton ? (
            <a
              className="header-cta header-cta--desktop"
              href={actionButton.href}
              target={isExternalHref(actionButton.href) ? '_blank' : undefined}
              rel={isExternalHref(actionButton.href) ? 'noopener noreferrer' : undefined}
            >
              {actionButton.label}
            </a>
          ) : null}
        </div>
      ) : (
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          {menuItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          {actionLink ? (
            <Link className="action-link" to={actionLink.to} onClick={() => setMenuOpen(false)}>
              {actionLink.label}
            </Link>
          ) : null}
          {actionButton ? (
            <a
              className="header-cta header-cta--mobile"
              href={actionButton.href}
              target={isExternalHref(actionButton.href) ? '_blank' : undefined}
              rel={isExternalHref(actionButton.href) ? 'noopener noreferrer' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {actionButton.label}
            </a>
          ) : null}
        </nav>
      )}
    </header>
  )
}

export default Header
