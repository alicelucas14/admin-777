import { useState } from 'react'

function GlobalSettingsSection({ siteSettings, onUpdateSettings }) {
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [socialRows, setSocialRows] = useState(() => normalizeSocialRows(siteSettings?.socialLinks))
  const [partnerRows, setPartnerRows] = useState(() =>
    normalizePartnerRows(siteSettings?.withdrawalPartners),
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      siteName: String(formData.get('siteName') || ''),
      defaultLanguage: String(formData.get('defaultLanguage') || ''),
      maintenanceMode: formData.get('maintenanceMode') === 'on',
      supportEmail: String(formData.get('supportEmail') || ''),
      liveChatLink: String(formData.get('liveChatLink') || ''),
      contactPage: {
        title: String(formData.get('contactTitle') || ''),
        intro: String(formData.get('contactIntro') || ''),
        address: String(formData.get('contactAddress') || ''),
        phoneText: String(formData.get('contactPhoneText') || ''),
        emailText: String(formData.get('contactEmailText') || ''),
        workingHours: String(formData.get('contactWorkingHours') || ''),
        pressCopy: String(formData.get('contactPressCopy') || ''),
        supportCopy: String(formData.get('contactSupportCopy') || ''),
        salesCopy: String(formData.get('contactSalesCopy') || ''),
      },
      socialLinks: socialRows
        .map((row) => ({
          id: row.id,
          platform: row.platform.trim(),
          url: row.url.trim(),
          iconUrl: row.iconUrl.trim(),
        }))
        .filter((row) => row.platform && row.url),
      withdrawalPartners: partnerRows
        .map((row) => ({
          id: row.id,
          name: row.name.trim(),
          url: row.url.trim(),
          imageUrl: row.imageUrl.trim(),
        }))
        .filter((row) => row.name),
    }

    setIsSaving(true)
    try {
      await onUpdateSettings(payload)
      setSubmitMessage('Site settings updated.')
    } catch {
      setSubmitError('Could not update site settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSocialRow = (id, field, value) => {
    setSocialRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const addSocialRow = () => {
    setSocialRows((current) => [
      ...current,
      {
        id: `social-${Date.now()}`,
        platform: '',
        url: '',
        iconUrl: '',
      },
    ])
  }

  const removeSocialRow = (id) => {
    setSocialRows((current) => current.filter((row) => row.id !== id))
  }

  const handleSocialIconFile = async (id, file) => {
    if (!file) {
      return
    }

    try {
      const encoded = await toDataUrl(file)
      updateSocialRow(id, 'iconUrl', encoded)
      setSubmitError('')
    } catch {
      setSubmitError('Social icon upload failed. Please choose a JPG, PNG, or WEBP image.')
    }
  }

  const updatePartnerRow = (id, field, value) => {
    setPartnerRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const addPartnerRow = () => {
    setPartnerRows((current) => [
      ...current,
      {
        id: `partner-${Date.now()}`,
        name: '',
        url: '',
        imageUrl: '',
      },
    ])
  }

  const removePartnerRow = (id) => {
    setPartnerRows((current) => current.filter((row) => row.id !== id))
  }

  const handlePartnerImageFile = async (id, file) => {
    if (!file) {
      return
    }

    try {
      const encoded = await toDataUrl(file)
      updatePartnerRow(id, 'imageUrl', encoded)
      setSubmitError('')
    } catch {
      setSubmitError('Partner image upload failed. Please choose a JPG, PNG, or WEBP image.')
    }
  }

  return (
    <section id="site-settings" className="section-block games-admin-panel settings-admin-panel">
      <h2 className="games-title">Site Settings</h2>
      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Global Settings</h3>
            <p>Edit site details and footer social media links.</p>
          </div>
        </div>

        <form className="settings-editor-form" onSubmit={handleSubmit}>
          <label>
            <span>Site Name</span>
            <input name="siteName" defaultValue={siteSettings?.siteName || ''} />
          </label>
          <label>
            <span>Default Language</span>
            <input name="defaultLanguage" defaultValue={siteSettings?.defaultLanguage || ''} />
          </label>
          <label>
            <span>Support Email</span>
            <input name="supportEmail" type="email" defaultValue={siteSettings?.supportEmail || ''} />
          </label>
          <label>
            <span>Live Chat Link or Embed Code</span>
            <textarea
              name="liveChatLink"
              rows={4}
              placeholder="Paste your LiveChat script or a normal live chat URL"
              defaultValue={siteSettings?.liveChatLink || ''}
            />
          </label>
          <label className="settings-checkbox-label">
            <input
              name="maintenanceMode"
              type="checkbox"
              defaultChecked={Boolean(siteSettings?.maintenanceMode)}
            />
            <span>Maintenance Mode</span>
          </label>

          <div className="settings-form-divider">
            <h4>Contact Page Information</h4>
          </div>
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
            <span>Address Text</span>
            <textarea
              name="contactAddress"
              rows={3}
              defaultValue={siteSettings?.contactPage?.address || ''}
            />
          </label>
          <label>
            <span>Contact Phone Text</span>
            <textarea
              name="contactPhoneText"
              rows={3}
              defaultValue={siteSettings?.contactPage?.phoneText || ''}
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
            <span>Working Hours</span>
            <textarea
              name="contactWorkingHours"
              rows={3}
              defaultValue={siteSettings?.contactPage?.workingHours || ''}
            />
          </label>
          <label>
            <span>Press Card Text</span>
            <textarea
              name="contactPressCopy"
              rows={3}
              defaultValue={siteSettings?.contactPage?.pressCopy || ''}
            />
          </label>
          <label>
            <span>Help & Supports Card Text</span>
            <textarea
              name="contactSupportCopy"
              rows={3}
              defaultValue={siteSettings?.contactPage?.supportCopy || ''}
            />
          </label>
          <label>
            <span>Sales Card Text</span>
            <textarea
              name="contactSalesCopy"
              rows={3}
              defaultValue={siteSettings?.contactPage?.salesCopy || ''}
            />
          </label>

          <div className="settings-form-divider settings-social-header">
            <h4>Footer Social Links</h4>
            <button type="button" onClick={addSocialRow}>
              Add Social Media
            </button>
          </div>

          <div className="settings-social-list">
            {socialRows.map((row) => (
              <div className="settings-social-row" key={row.id}>
                <label>
                  <span>Platform</span>
                  <input
                    value={row.platform}
                    placeholder="Facebook"
                    onChange={(event) => updateSocialRow(row.id, 'platform', event.target.value)}
                  />
                </label>
                <label>
                  <span>Link URL</span>
                  <input
                    type="url"
                    value={row.url}
                    placeholder="https://facebook.com/your-page"
                    onChange={(event) => updateSocialRow(row.id, 'url', event.target.value)}
                  />
                </label>
                <label>
                  <span>Icon Image URL</span>
                  <input
                    type="url"
                    value={row.iconUrl}
                    placeholder="https://cdn.simpleicons.org/facebook/white"
                    onChange={(event) => updateSocialRow(row.id, 'iconUrl', event.target.value)}
                  />
                </label>
                <label>
                  <span>Upload Icon</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(event) => handleSocialIconFile(row.id, event.target.files?.[0])}
                  />
                </label>
                <button type="button" onClick={() => removeSocialRow(row.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="settings-form-divider settings-social-header">
            <h4>Withdrawal Partners</h4>
            <button type="button" onClick={addPartnerRow}>
              Add Partner
            </button>
          </div>

          <div className="settings-social-list">
            {partnerRows.map((row) => (
              <div className="settings-social-row settings-partner-row" key={row.id}>
                <label>
                  <span>Partner Name</span>
                  <input
                    value={row.name}
                    placeholder="Paytm"
                    onChange={(event) => updatePartnerRow(row.id, 'name', event.target.value)}
                  />
                </label>
                <label>
                  <span>Partner Link</span>
                  <input
                    type="url"
                    value={row.url}
                    placeholder="https://paytm.com"
                    onChange={(event) => updatePartnerRow(row.id, 'url', event.target.value)}
                  />
                </label>
                <label>
                  <span>Image URL</span>
                  <input
                    type="url"
                    value={row.imageUrl}
                    placeholder="https://example.com/paytm.webp"
                    onChange={(event) => updatePartnerRow(row.id, 'imageUrl', event.target.value)}
                  />
                </label>
                <label>
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(event) => handlePartnerImageFile(row.id, event.target.files?.[0])}
                  />
                </label>
                <button type="button" onClick={() => removePartnerRow(row.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="settings-editor-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {submitMessage ? <p className="settings-success">{submitMessage}</p> : null}
          {submitError ? <p className="games-form-error">{submitError}</p> : null}
        </form>
      </div>
    </section>
  )
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

function normalizeSocialRows(value) {
  if (Array.isArray(value)) {
    return value.map((row, index) => ({
      id: String(row.id || `social-${index}`),
      platform: String(row.platform || ''),
      url: String(row.url || ''),
      iconUrl: String(row.iconUrl || ''),
    }))
  }

  return Object.entries(value || {}).map(([platform, url]) => ({
    id: platform,
    platform,
    url: String(url || ''),
    iconUrl: defaultSocialIcon(platform),
  }))
}

function normalizePartnerRows(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((row, index) => ({
    id: String(row.id || `partner-${index}`),
    name: String(row.name || ''),
    url: String(row.url || ''),
    imageUrl: String(row.imageUrl || ''),
  }))
}

function defaultSocialIcon(platform) {
  const key = String(platform || '').toLowerCase().trim()
  const iconMap = {
    facebook: 'https://cdn.simpleicons.org/facebook/white',
    twitter: 'https://cdn.simpleicons.org/x/white',
    x: 'https://cdn.simpleicons.org/x/white',
    instagram: 'https://cdn.simpleicons.org/instagram/white',
    telegram: 'https://cdn.simpleicons.org/telegram/white',
    youtube: 'https://cdn.simpleicons.org/youtube/white',
  }

  return iconMap[key] || ''
}

export default GlobalSettingsSection
