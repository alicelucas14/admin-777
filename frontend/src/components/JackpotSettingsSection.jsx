import { useEffect, useState } from 'react'
import { IMAGE_UPLOAD_ACCEPT, SUPPORTED_IMAGE_FORMATS_LABEL, toDataUrl } from '../utils/imageUpload'

function JackpotSettingsSection({ siteSettings, onUpdateSettings }) {
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [jackpotRows, setJackpotRows] = useState(() =>
    normalizeJackpotRows(siteSettings?.jackpotSection?.items),
  )

  useEffect(() => {
    setJackpotRows(normalizeJackpotRows(siteSettings?.jackpotSection?.items))
  }, [siteSettings])

  const computedTotal = jackpotRows.reduce(
    (sum, row) => sum + normalizeAmount(row.amount),
    0,
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      jackpotSection: {
        title: String(formData.get('jackpotTitle') || ''),
        prizePoolLabel: String(formData.get('jackpotPrizePoolLabel') || ''),
        totalAmount: computedTotal,
        items: jackpotRows
          .map((row) => ({
            id: row.id,
            title: row.title.trim(),
            amount: Number(row.amount || 0),
            imageUrl: row.imageUrl.trim(),
          }))
          .filter((row) => row.title),
      },
    }

    setIsSaving(true)
    try {
      await onUpdateSettings(payload)
      setSubmitMessage('Jackpot section updated.')
    } catch {
      setSubmitError('Could not update the jackpot section. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateJackpotRow = (id, field, value) => {
    setJackpotRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const addJackpotRow = () => {
    setJackpotRows((current) => [
      ...current,
      {
        id: `jackpot-${Date.now()}`,
        title: '',
        amount: '',
        imageUrl: '',
      },
    ])
  }

  const removeJackpotRow = (id) => {
    setJackpotRows((current) => current.filter((row) => row.id !== id))
  }

  const handleJackpotImageFile = async (id, file) => {
    if (!file) {
      return
    }

    try {
      const encoded = await toDataUrl(file)
      updateJackpotRow(id, 'imageUrl', encoded)
      setSubmitError('')
    } catch {
      setSubmitError(`Jackpot image upload failed. Please choose a ${SUPPORTED_IMAGE_FORMATS_LABEL} image.`)
    }
  }

  return (
    <section id="jackpot-settings" className="section-block games-admin-panel settings-admin-panel">
      <h2 className="games-title">Jackpot Section</h2>
      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Homepage Jackpot</h3>
            <p>Edit the jackpot headline, total pool amount, and the game cards shown on the public homepage.</p>
          </div>
        </div>

        <form className="settings-editor-form" onSubmit={handleSubmit}>
          <label>
            <span>Section Title</span>
            <input
              name="jackpotTitle"
              defaultValue={siteSettings?.jackpotSection?.title || ''}
            />
          </label>
          <label>
            <span>Prize Pool Label</span>
            <input
              name="jackpotPrizePoolLabel"
              defaultValue={siteSettings?.jackpotSection?.prizePoolLabel || ''}
            />
          </label>
          <label>
            <span>Total Jackpot Amount</span>
            <input
              type="text"
              value={computedTotal.toFixed(2)}
              readOnly
            />
          </label>

          <div className="settings-form-divider settings-social-header">
            <h4>Jackpot Cards</h4>
            <button type="button" onClick={addJackpotRow}>
              Add Card
            </button>
          </div>

          <div className="settings-social-list">
            {jackpotRows.map((row) => (
              <div className="settings-social-row settings-partner-row" key={row.id}>
                <label>
                  <span>Game Name</span>
                  <input
                    value={row.title || ''}
                    placeholder="Aztec's Millions"
                    onChange={(event) => updateJackpotRow(row.id, 'title', event.target.value)}
                  />
                </label>
                <label>
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.amount ?? ''}
                    placeholder="1797081.18"
                    onChange={(event) => updateJackpotRow(row.id, 'amount', event.target.value)}
                  />
                </label>
                <label>
                  <span>Image URL</span>
                  <input
                    type="text"
                    value={row.imageUrl || ''}
                    placeholder="https://example.com/jackpot-card.webp or /uploads/..."
                    onChange={(event) => updateJackpotRow(row.id, 'imageUrl', event.target.value)}
                  />
                </label>
                <label>
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept={IMAGE_UPLOAD_ACCEPT}
                    onChange={(event) => handleJackpotImageFile(row.id, event.target.files?.[0])}
                  />
                </label>
                <button type="button" onClick={() => removeJackpotRow(row.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="settings-editor-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Jackpot Section'}
            </button>
          </div>

          {submitMessage ? <p className="settings-success">{submitMessage}</p> : null}
          {submitError ? <p className="games-form-error">{submitError}</p> : null}
        </form>
      </div>
    </section>
  )
}

function normalizeJackpotRows(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        id: 'jackpot-default-1',
        title: '',
        amount: '',
        imageUrl: '',
      },
    ]
  }

  return value.map((row, index) => ({
    id: row.id || `jackpot-row-${index + 1}`,
    title: row.title || '',
    amount: row.amount ?? '',
    imageUrl: row.imageUrl || '',
  }))
}

function normalizeAmount(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export default JackpotSettingsSection