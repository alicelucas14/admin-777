import { useEffect, useState } from 'react'

function PopupCampaignSettingsSection({ siteSettings, onUpdateSettings }) {
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [campaignEnabled, setCampaignEnabled] = useState(Boolean(siteSettings?.popupCampaign?.enabled))
  const [slides, setSlides] = useState(() => normalizePopupSlides(siteSettings?.popupCampaign))
  const activeSlideCount = slides.filter((slide) => Boolean(slide.enabled)).length
  const hasCtaCount = slides.filter((slide) => Boolean(slide.buttonUrl)).length

  useEffect(() => {
    setCampaignEnabled(Boolean(siteSettings?.popupCampaign?.enabled))
    setSlides(normalizePopupSlides(siteSettings?.popupCampaign))
  }, [siteSettings])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      popupCampaign: {
        enabled: campaignEnabled,
        items: slides.map((slide, index) => ({
          id: slide.id || `popup-slide-${index + 1}`,
          enabled: Boolean(slide.enabled),
          eyebrow: slide.eyebrow,
          title: slide.title,
          message: slide.message,
          imageUrl: slide.imageUrl,
          buttonLabel: slide.buttonLabel,
          buttonUrl: slide.buttonUrl,
        })),
      },
    }

    setIsSaving(true)
    try {
      await onUpdateSettings(payload)
      setSubmitMessage('Popup campaign updated.')
    } catch {
      setSubmitError('Could not update the popup campaign. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSlideChange = (index, field, value) => {
    setSlides((currentSlides) =>
      currentSlides.map((slide, slideIndex) =>
        slideIndex === index
          ? {
              ...slide,
              [field]: value,
            }
          : slide,
      ),
    )
  }

  const handleImageFile = async (index, file) => {
    if (!file) {
      return
    }

    try {
      const encoded = await toDataUrl(file)
      handleSlideChange(index, 'imageUrl', encoded)
      setSubmitError('')
    } catch {
      setSubmitError('Popup image upload failed. Please choose a JPG, PNG, or WEBP image.')
    }
  }

  return (
    <section id="popup-campaign-settings" className="section-block games-admin-panel settings-admin-panel">
      <h2 className="games-title">Popups</h2>
      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Popup Campaign</h3>
            <p>Use this panel for announcements, promotions, notices, and advertisement popups shown on public pages.</p>
          </div>
        </div>

        <form className="settings-editor-form" onSubmit={handleSubmit}>
          <div className="popup-campaign-overview">
            <div className="popup-campaign-overview-copy">
              <span className="popup-campaign-overline">Campaign Controls</span>
              <h4>Control how announcement popups appear across the public site.</h4>
              <p>Enable the campaign, choose which slides are active, and update each message without changing the frontend layout.</p>
            </div>
            <div className="popup-campaign-overview-metrics">
              <span className={campaignEnabled ? 'popup-campaign-state is-live' : 'popup-campaign-state is-paused'}>
                {campaignEnabled ? 'Campaign Live' : 'Campaign Paused'}
              </span>
              <span className="popup-campaign-metric">{`${activeSlideCount} of ${slides.length} slides active`}</span>
            </div>
          </div>

          <div className="popup-campaign-stats-grid">
            <article className="popup-campaign-stat-card">
              <span className="popup-campaign-stat-label">Visibility</span>
              <strong>{campaignEnabled ? 'Shown on refresh' : 'Hidden sitewide'}</strong>
              <p>{campaignEnabled ? 'Visitors will see enabled slides as soon as the public site loads.' : 'The campaign settings are saved but nothing is currently shown to visitors.'}</p>
            </article>
            <article className="popup-campaign-stat-card">
              <span className="popup-campaign-stat-label">Active Slides</span>
              <strong>{activeSlideCount}</strong>
              <p>Only enabled slides are used in the public popup rotation.</p>
            </article>
            <article className="popup-campaign-stat-card">
              <span className="popup-campaign-stat-label">CTA Links</span>
              <strong>{hasCtaCount}</strong>
              <p>Slides with a button URL will show a primary call to action button.</p>
            </article>
          </div>

          <label className="settings-checkbox-label popup-campaign-toggle">
            <input
              name="popupEnabled"
              type="checkbox"
              checked={campaignEnabled}
              onChange={(event) => setCampaignEnabled(event.target.checked)}
            />
            <span>{campaignEnabled ? 'Popup campaign is enabled' : 'Enable popup campaign'}</span>
          </label>
          <div className="settings-form-divider">
            <h4>Popup Slides</h4>
          </div>

          <div className="settings-social-list">
            {slides.map((slide, index) => (
              <div key={slide.id || `popup-slide-${index + 1}`} className="settings-manage-card settings-partner-card popup-slide-card">
                <div className="settings-form-divider popup-slide-header">
                  <div>
                    <h4>{`Slide ${index + 1}`}</h4>
                    <p className="popup-slide-subtitle">Configure the message, action button, and visual for this popup slide.</p>
                  </div>
                  <span
                    className={Boolean(slide.enabled) ? 'popup-slide-status is-enabled' : 'popup-slide-status is-disabled'}
                  >
                    {Boolean(slide.enabled) ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="popup-slide-topbar">
                  <label className="settings-checkbox-label popup-slide-toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(slide.enabled)}
                      onChange={(event) => handleSlideChange(index, 'enabled', event.target.checked)}
                    />
                    <span>{`Enable Slide ${index + 1}`}</span>
                  </label>
                  <div className="popup-slide-flags">
                    <span className="popup-slide-flag">{slide.imageUrl ? 'Image Attached' : 'No Image'}</span>
                    <span className="popup-slide-flag">{slide.buttonUrl ? 'CTA Ready' : 'No CTA Link'}</span>
                  </div>
                </div>

                <div className="popup-slide-editor-grid">
                  <div className="popup-slide-form-column">
                    <section className="popup-slide-panel">
                      <div className="popup-slide-panel-head">
                        <h5>Message Content</h5>
                        <p>Set the headline and body copy visitors see in the popup.</p>
                      </div>
                      <div className="popup-slide-fields popup-slide-fields-main">
                        <label>
                          <span>Eyebrow</span>
                          <input
                            value={slide.eyebrow}
                            placeholder="Latest Update"
                            onChange={(event) => handleSlideChange(index, 'eyebrow', event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Title</span>
                          <input
                            value={slide.title}
                            placeholder="Important service announcement"
                            onChange={(event) => handleSlideChange(index, 'title', event.target.value)}
                          />
                        </label>
                        <label className="popup-slide-message-field">
                          <span>Message</span>
                          <textarea
                            rows={5}
                            value={slide.message}
                            placeholder="Share updates, offers, or any message visitors should see first."
                            onChange={(event) => handleSlideChange(index, 'message', event.target.value)}
                          />
                        </label>
                      </div>
                    </section>

                    <section className="popup-slide-panel">
                      <div className="popup-slide-panel-head">
                        <h5>Action Button</h5>
                        <p>Use the CTA to direct visitors to a promotion, guide, or landing page.</p>
                      </div>
                      <div className="popup-slide-fields popup-slide-fields-actions">
                        <label>
                          <span>Button Label</span>
                          <input
                            value={slide.buttonLabel}
                            placeholder="Learn more"
                            onChange={(event) => handleSlideChange(index, 'buttonLabel', event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Button URL</span>
                          <input
                            type="url"
                            value={slide.buttonUrl}
                            placeholder="https://example.com/update"
                            onChange={(event) => handleSlideChange(index, 'buttonUrl', event.target.value)}
                          />
                        </label>
                      </div>
                    </section>
                  </div>

                  <aside className="popup-slide-side-column">
                    <section className="popup-slide-panel popup-slide-preview-panel">
                      <div className="popup-slide-panel-head">
                        <h5>Quick Preview</h5>
                        <p>A compact preview of the content hierarchy visitors will see.</p>
                      </div>
                      <div className="popup-slide-preview-card">
                        <span className="popup-slide-preview-eyebrow">{slide.eyebrow || 'Eyebrow text'}</span>
                        <h6>{slide.title || 'Slide title preview'}</h6>
                        <p>{slide.message || 'Add a message to preview the popup copy.'}</p>
                        <div className="popup-slide-preview-actions">
                          <span className="popup-slide-preview-button">{slide.buttonLabel || 'Learn more'}</span>
                          <span className="popup-slide-preview-note">{slide.buttonUrl ? 'Destination linked' : 'No destination set'}</span>
                        </div>
                      </div>
                    </section>

                    <section className="popup-slide-panel">
                      <div className="popup-slide-panel-head">
                        <h5>Visual Asset</h5>
                        <p>Add an image by URL or upload one from your device.</p>
                      </div>
                      <div className="popup-slide-fields popup-slide-fields-media">
                        <label>
                          <span>Image URL</span>
                          <input
                            type="url"
                            value={slide.imageUrl}
                            placeholder="https://example.com/popup-image.webp"
                            onChange={(event) => handleSlideChange(index, 'imageUrl', event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            onChange={(event) => handleImageFile(index, event.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </section>
                  </aside>
                </div>
              </div>
            ))}
          </div>

          <div className="settings-editor-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Popup Campaign'}
            </button>
          </div>

          {submitMessage ? <p className="settings-success">{submitMessage}</p> : null}
          {submitError ? <p className="games-form-error">{submitError}</p> : null}
        </form>
      </div>
    </section>
  )
}

function normalizePopupSlides(campaign) {
  const fallbackSlides = [
    {
      id: 'popup-slide-1',
      enabled: true,
      eyebrow: 'Latest Update',
      title: 'Stay tuned for Stars777 updates',
      message:
        'Use this popup for promotions, service notices, product launches, or any important announcement you want visitors to see first.',
      imageUrl: '',
      buttonLabel: 'Learn more',
      buttonUrl: '',
    },
    {
      id: 'popup-slide-2',
      enabled: true,
      eyebrow: 'Featured Offer',
      title: 'Highlight your newest campaign',
      message:
        'Showcase limited-time bonuses, referral pushes, or homepage announcements in a rotating slide.',
      imageUrl: '',
      buttonLabel: 'View details',
      buttonUrl: '',
    },
    {
      id: 'popup-slide-3',
      enabled: true,
      eyebrow: 'Service Notice',
      title: 'Keep players informed',
      message:
        'Use the third slide for payment updates, maintenance notices, or any message visitors should not miss.',
      imageUrl: '',
      buttonLabel: 'Learn more',
      buttonUrl: '',
    },
  ]

  const sourceSlides = Array.isArray(campaign?.items) && campaign.items.length
    ? campaign.items
    : [campaign || {}]

  return fallbackSlides.map((fallbackSlide, index) => {
    const sourceSlide = sourceSlides[index] || {}

    return {
      id: String(sourceSlide.id || fallbackSlide.id),
      enabled: typeof sourceSlide.enabled === 'boolean' ? sourceSlide.enabled : Boolean(fallbackSlide.enabled),
      eyebrow: String(sourceSlide.eyebrow || fallbackSlide.eyebrow || ''),
      title: String(sourceSlide.title || fallbackSlide.title || ''),
      message: String(sourceSlide.message || fallbackSlide.message || ''),
      imageUrl: String(sourceSlide.imageUrl || fallbackSlide.imageUrl || ''),
      buttonLabel: String(sourceSlide.buttonLabel || fallbackSlide.buttonLabel || 'Learn more'),
      buttonUrl: String(sourceSlide.buttonUrl || fallbackSlide.buttonUrl || ''),
    }
  })
}

function toDataUrl(file) {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!supportedTypes.includes(file.type)) {
    return Promise.reject(new Error('unsupported_image_type'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('file_read_failed'))
    reader.readAsDataURL(file)
  })
}

export default PopupCampaignSettingsSection
