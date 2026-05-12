import { useState } from 'react'

function TermsConditionsSection({ termsPage, privacyPage, onUpdateTerms }) {
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      termsPage: {
        title: String(formData.get('termsTitle') || ''),
        body: String(formData.get('termsBody') || ''),
      },
      privacyPage: {
        title: String(formData.get('privacyTitle') || ''),
        body: String(formData.get('privacyBody') || ''),
      },
    }

    setIsSaving(true)
    try {
      await onUpdateTerms(payload)
      setSubmitMessage('Terms and Conditions updated.')
    } catch {
      setSubmitError('Could not update Terms and Conditions. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section id="terms-conditions" className="section-block games-admin-panel settings-admin-panel">
      <h2 className="games-title">Terms & Conditions</h2>
      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Terms of Service Content</h3>
            <p>Edit the public Terms and Conditions page shown on the frontend.</p>
          </div>
        </div>

        <form className="settings-editor-form terms-editor-form" onSubmit={handleSubmit}>
          <div className="settings-form-divider">
            <h4>Terms of Service</h4>
          </div>
          <label>
            <span>Page Title</span>
            <input name="termsTitle" defaultValue={termsPage?.title || ''} />
          </label>
          <label>
            <span>Terms Body</span>
            <textarea
              name="termsBody"
              rows={18}
              defaultValue={termsPage?.body || ''}
              placeholder="Add the full terms and conditions text here"
            />
          </label>

          <div className="settings-form-divider">
            <h4>Privacy Policy</h4>
          </div>
          <label>
            <span>Privacy Policy Title</span>
            <input name="privacyTitle" defaultValue={privacyPage?.title || ''} />
          </label>
          <label>
            <span>Privacy Policy Body</span>
            <textarea
              name="privacyBody"
              rows={18}
              defaultValue={privacyPage?.body || ''}
              placeholder="Add the full privacy policy text here"
            />
          </label>

          <div className="settings-editor-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Legal Pages'}
            </button>
          </div>

          {submitMessage ? <p className="settings-success">{submitMessage}</p> : null}
          {submitError ? <p className="games-form-error">{submitError}</p> : null}
        </form>
      </div>
    </section>
  )
}

export default TermsConditionsSection