import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

const POPUP_ROTATION_DELAY_MS = 5000

function PopupCampaign() {
  const location = useLocation()
  const [campaign, setCampaign] = useState(null)
  const [isClosed, setIsClosed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      return
    }

    let cancelled = false

    const fetchCampaign = async () => {
      try {
        const response = await fetch(`${publicApiBase}/site-settings`)
        if (!response.ok) {
          throw new Error('campaign_fetch_failed')
        }

        const result = await response.json()
        if (!cancelled) {
          setCampaign(normalizeCampaign(result?.popupCampaign))
        }
      } catch {
        if (!cancelled) {
          setCampaign(null)
        }
      }
    }

    fetchCampaign()

    return () => {
      cancelled = true
    }
  }, [location.pathname, publicApiBase])

  useEffect(() => {
    setIsClosed(false)
    setActiveIndex(0)
  }, [campaign])

  useEffect(() => {
    if (!campaign?.enabled || isClosed || campaign.items.length < 2) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % campaign.items.length)
    }, POPUP_ROTATION_DELAY_MS)

    return () => window.clearInterval(timer)
  }, [campaign, isClosed])

  if (location.pathname.startsWith('/admin')) {
    return null
  }

  if (!campaign?.enabled || isClosed) {
    return null
  }

  const handleClose = () => {
    setIsClosed(true)
  }

  const visibleItems = campaign.items

  const handleSelectSlide = (index) => {
    setActiveIndex(index)
  }

  return (
    <div className="popup-campaign-overlay" role="presentation" onClick={handleClose}>
      <section
        className="popup-campaign-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-campaign-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="popup-campaign-close" onClick={handleClose} aria-label="Close popup">
          ×
        </button>

        <div className="popup-campaign-viewport">
          <div
            className="popup-campaign-track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {visibleItems.map((item, index) => (
              <article className="popup-campaign-slide" key={item.id || `popup-slide-${index + 1}`} aria-hidden={index !== activeIndex}>
                <div className="popup-campaign-layout">
                  <div className="popup-campaign-copy">
                    {item.eyebrow ? <p className="popup-campaign-eyebrow">{item.eyebrow}</p> : null}
                    <h2 id={index === activeIndex ? 'popup-campaign-title' : undefined}>{item.title}</h2>
                    <p className="popup-campaign-message">{item.message}</p>

                    <div className="popup-campaign-actions">
                      {item.buttonUrl ? (
                        <a
                          className="popup-campaign-button"
                          href={item.buttonUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.buttonLabel}
                        </a>
                      ) : null}
                      <button type="button" className="popup-campaign-dismiss" onClick={handleClose}>
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {item.imageUrl ? (
                    <div className="popup-campaign-visual" aria-hidden="true">
                      <img src={item.imageUrl} alt="" className="popup-campaign-image" loading="lazy" decoding="async" />
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>

        {visibleItems.length > 1 ? (
          <div className="popup-campaign-nav" aria-label="Popup slides">
            {visibleItems.map((item, index) => (
              <button
                key={item.id || `popup-dot-${index + 1}`}
                type="button"
                className={index === activeIndex ? 'popup-campaign-dot is-active' : 'popup-campaign-dot'}
                aria-label={`Show popup slide ${index + 1}`}
                onClick={() => handleSelectSlide(index)}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function normalizeCampaign(value) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const items = normalizeCampaignItems(value)

  if (!items.length) {
    return null
  }

  return {
    enabled: Boolean(value.enabled),
    items,
  }
}

function normalizeCampaignItems(value) {
  const sourceItems = Array.isArray(value?.items) && value.items.length ? value.items : [value]

  return sourceItems
    .map((item, index) => ({
      id: String(item?.id || `popup-slide-${index + 1}`).trim(),
      enabled: typeof item?.enabled === 'boolean' ? item.enabled : true,
      eyebrow: String(item?.eyebrow || '').trim(),
      title: String(item?.title || '').trim(),
      message: String(item?.message || '').trim(),
      imageUrl: String(item?.imageUrl || '').trim(),
      buttonLabel: String(item?.buttonLabel || '').trim() || 'Learn more',
      buttonUrl: String(item?.buttonUrl || '').trim(),
    }))
    .filter((item) => item.enabled && (item.title || item.message || item.imageUrl || item.buttonUrl))
    .slice(0, 3)
}

export default PopupCampaign
