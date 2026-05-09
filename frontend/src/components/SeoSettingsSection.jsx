import { useState } from 'react'

function SeoSettingsSection({ seo, onUpdateSeo }) {
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      keywords: String(formData.get('keywords') || ''),
      canonicalUrl: String(formData.get('canonicalUrl') || ''),
      ogImageUrl: String(formData.get('ogImageUrl') || ''),
    }

    setIsSaving(true)
    try {
      await onUpdateSeo(payload)
      setSubmitMessage('SEO settings updated. The frontend will use these values.')
    } catch {
      setSubmitError('Could not update SEO settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section id="seo" className="section-block games-admin-panel settings-admin-panel">
      <h2 className="games-title">SEO</h2>
      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Frontend SEO Settings</h3>
            <p>Control the page title, search description, keywords, and social share image.</p>
          </div>
        </div>

        <form className="settings-editor-form seo-editor-form" onSubmit={handleSubmit}>
          <label>
            <span>SEO Title</span>
            <input
              name="title"
              defaultValue={seo?.title || ''}
              placeholder="Stars777 - Online Gaming Platform"
            />
          </label>
          <label>
            <span>Canonical URL</span>
            <input
              name="canonicalUrl"
              type="url"
              defaultValue={seo?.canonicalUrl || ''}
              placeholder="https://stars777.com"
            />
          </label>
          <label>
            <span>SEO Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={seo?.description || ''}
              placeholder="Short search engine description for your website"
            />
          </label>
          <label>
            <span>SEO Keywords</span>
            <textarea
              name="keywords"
              rows={4}
              defaultValue={seo?.keywords || ''}
              placeholder="Stars777, online gaming India, Rummy"
            />
          </label>
          <label>
            <span>Social Share Image URL</span>
            <input
              name="ogImageUrl"
              type="text"
              defaultValue={seo?.ogImageUrl || ''}
              placeholder="https://example.com/share-image.webp or /uploads/..."
            />
          </label>

          <div className="settings-editor-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save SEO'}
            </button>
          </div>

          {submitMessage ? <p className="settings-success">{submitMessage}</p> : null}
          {submitError ? <p className="games-form-error">{submitError}</p> : null}
        </form>
      </div>
    </section>
  )
}

export default SeoSettingsSection
