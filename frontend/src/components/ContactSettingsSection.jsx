import { useEffect, useState } from 'react'
import { IMAGE_UPLOAD_ACCEPT, SUPPORTED_IMAGE_FORMATS_LABEL, toDataUrl } from '../utils/imageUpload'

function ContactSettingsSection({ siteSettings, onUpdateSettings }) {
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [contactImageFields, setContactImageFields] = useState(() =>
    normalizeContactImageFields(siteSettings?.contactPage),
  )

  useEffect(() => {
    setContactImageFields(normalizeContactImageFields(siteSettings?.contactPage))
  }, [siteSettings])

  const updateContactImageField = (field, value) => {
    setContactImageFields((current) => ({ ...current, [field]: value }))
  }

  const handleContactImageFile = async (field, file) => {
    if (!file) {
      return
    }

    try {
      const encoded = await toDataUrl(file)
      updateContactImageField(field, encoded)
      setSubmitError('')
    } catch {
      setSubmitError(`Contact image upload failed. Please choose a ${SUPPORTED_IMAGE_FORMATS_LABEL} image.`)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      contactPage: {
        title: String(formData.get('contactTitle') || ''),
        intro: String(formData.get('contactIntro') || ''),
        liveChatLink: String(formData.get('contactLiveChatLink') || ''),
        supportCopy: String(formData.get('contactSupportCopy') || ''),
        emailText: String(formData.get('contactEmailText') || ''),
        salesCopy: String(formData.get('contactSalesCopy') || ''),
        liveChatImageUrl: contactImageFields.liveChatImageUrl,
        emailCardImageUrl: contactImageFields.emailCardImageUrl,
        callbackCardImageUrl: contactImageFields.callbackCardImageUrl,
        faqVisualImageUrl: contactImageFields.faqVisualImageUrl,
      },
    }

    setIsSaving(true)
    try {
      await onUpdateSettings(payload)
      setSubmitMessage('Contact page settings updated.')
    } catch {
      setSubmitError('Could not update contact page settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section id="contact-page-settings" className="section-block games-admin-panel settings-admin-panel">
      <h2 className="games-title">Contact Page</h2>
      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Contact Content</h3>
            <p>Edit the public contact page copy, card content, and contact visuals.</p>
          </div>
        </div>

        <form className="settings-editor-form" onSubmit={handleSubmit}>
          <label>
            <span>Contact Title</span>
            <input name="contactTitle" defaultValue={siteSettings?.contactPage?.title || ''} />
          </label>
          <label>
            <span>Contact Intro</span>
            <textarea
              name="contactIntro"
              rows={3}
              defaultValue={siteSettings?.contactPage?.intro || ''}
            />
          </label>
          <label>
            <span>Live Chat Card Text</span>
            <textarea
              name="contactSupportCopy"
              rows={3}
              defaultValue={siteSettings?.contactPage?.supportCopy || ''}
            />
          </label>
          <label>
            <span>Live Chat Link or Embed Code</span>
            <textarea
              name="contactLiveChatLink"
              rows={4}
              placeholder="Paste your LiveChat script or a normal live chat URL"
              defaultValue={siteSettings?.contactPage?.liveChatLink || ''}
            />
          </label>
          <label>
            <span>Email Text</span>
            <textarea
              name="contactEmailText"
              rows={3}
              defaultValue={siteSettings?.contactPage?.emailText || ''}
            />
          </label>
          <label>
            <span>Call Back Card Text</span>
            <textarea
              name="contactSalesCopy"
              rows={3}
              defaultValue={siteSettings?.contactPage?.salesCopy || ''}
            />
          </label>

          <div className="settings-form-divider">
            <h4>Contact Page Images</h4>
          </div>

          <div className="settings-social-list">
            {[
              ['liveChatImageUrl', 'Live Chat Card Image'],
              ['emailCardImageUrl', 'E-Mail Card Image'],
              ['callbackCardImageUrl', 'Call Back Card Image'],
              ['faqVisualImageUrl', 'FAQ Section Image'],
            ].map(([field, label]) => (
              <div className="settings-social-row settings-partner-row" key={field}>
                <label>
                  <span>{label}</span>
                  <input
                    type="text"
                    value={contactImageFields[field] || ''}
                    placeholder="https://example.com/contact-image.webp or /uploads/..."
                    onChange={(event) => updateContactImageField(field, event.target.value)}
                  />
                </label>
                <label>
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept={IMAGE_UPLOAD_ACCEPT}
                    onChange={(event) => handleContactImageFile(field, event.target.files?.[0])}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="settings-editor-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Contact Page'}
            </button>
          </div>

          {submitMessage ? <p className="settings-success">{submitMessage}</p> : null}
          {submitError ? <p className="games-form-error">{submitError}</p> : null}
        </form>
      </div>
    </section>
  )
}

function normalizeContactImageFields(value) {
  return {
    liveChatImageUrl: String(value?.liveChatImageUrl || ''),
    emailCardImageUrl: String(value?.emailCardImageUrl || ''),
    callbackCardImageUrl: String(value?.callbackCardImageUrl || ''),
    faqVisualImageUrl: String(value?.faqVisualImageUrl || ''),
  }
}

export default ContactSettingsSection