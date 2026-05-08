import { useEffect, useState } from 'react'
import { IMAGE_UPLOAD_ACCEPT, SUPPORTED_IMAGE_FORMATS_LABEL, toDataUrl } from '../utils/imageUpload'

function RummySectionSettingsSection({ siteSettings, onUpdateSettings }) {
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [sectionFields, setSectionFields] = useState(() =>
    normalizeSectionFields(siteSettings?.homepageFaqSection),
  )
  const [itemRows, setItemRows] = useState(() =>
    normalizeRummyRows(siteSettings?.homepageFaqSection?.items),
  )

  useEffect(() => {
    setSectionFields(normalizeSectionFields(siteSettings?.homepageFaqSection))
    setItemRows(normalizeRummyRows(siteSettings?.homepageFaqSection?.items))
  }, [siteSettings])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      homepageFaqSection: {
        title: String(formData.get('rummySectionTitle') || ''),
        imageUrl: sectionFields.imageUrl,
        items: itemRows
          .map((row) => ({
            id: row.id,
            question: row.question.trim(),
            answer: row.answer.trim(),
          }))
          .filter((row) => row.question && row.answer),
      },
    }

    setIsSaving(true)
    try {
      await onUpdateSettings(payload)
      setSubmitMessage('Rummy section updated.')
    } catch {
      setSubmitError('Could not update the Rummy section. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSectionField = (field, value) => {
    setSectionFields((current) => ({ ...current, [field]: value }))
  }

  const handleSectionImageFile = async (file) => {
    if (!file) {
      return
    }

    try {
      const encoded = await toDataUrl(file)
      updateSectionField('imageUrl', encoded)
      setSubmitError('')
    } catch {
      setSubmitError(`Rummy image upload failed. Please choose a ${SUPPORTED_IMAGE_FORMATS_LABEL} image.`)
    }
  }

  const updateItemRow = (id, field, value) => {
    setItemRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const addItemRow = () => {
    setItemRows((current) => [
      ...current,
      {
        id: `rummy-item-${Date.now()}`,
        question: '',
        answer: '',
      },
    ])
  }

  const removeItemRow = (id) => {
    setItemRows((current) => current.filter((row) => row.id !== id))
  }

  return (
    <section id="rummy-section-settings" className="section-block games-admin-panel settings-admin-panel">
      <h2 className="games-title">Rummy Section</h2>
      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Homepage Rummy Section</h3>
            <p>Edit the title, image, and accordion questions shown in the All About Rummy Game section.</p>
          </div>
        </div>

        <form className="settings-editor-form" onSubmit={handleSubmit}>
          <label>
            <span>Section Title</span>
            <input
              name="rummySectionTitle"
              defaultValue={siteSettings?.homepageFaqSection?.title || ''}
            />
          </label>
          <label>
            <span>Section Image URL</span>
            <input
              type="url"
              value={sectionFields.imageUrl}
              placeholder="https://example.com/rummy-section-image.webp"
              onChange={(event) => updateSectionField('imageUrl', event.target.value)}
            />
          </label>
          <label>
            <span>Upload Section Image</span>
            <input
              type="file"
              accept={IMAGE_UPLOAD_ACCEPT}
              onChange={(event) => handleSectionImageFile(event.target.files?.[0])}
            />
          </label>

          <div className="settings-form-divider settings-social-header">
            <h4>Accordion Items</h4>
            <button type="button" onClick={addItemRow}>
              Add Question
            </button>
          </div>

          <div className="settings-social-list">
            {itemRows.map((row) => (
              <div className="settings-social-row settings-rummy-row" key={row.id}>
                <label>
                  <span>Question</span>
                  <input
                    value={row.question}
                    placeholder="How do I claim my welcome bonus?"
                    onChange={(event) => updateItemRow(row.id, 'question', event.target.value)}
                  />
                </label>
                <label>
                  <span>Answer</span>
                  <textarea
                    value={row.answer}
                    placeholder="Write the answer shown when this item opens."
                    onChange={(event) => updateItemRow(row.id, 'answer', event.target.value)}
                  />
                </label>
                <button type="button" onClick={() => removeItemRow(row.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="settings-editor-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Rummy Section'}
            </button>
          </div>

          {submitMessage ? <p className="settings-success">{submitMessage}</p> : null}
          {submitError ? <p className="games-form-error">{submitError}</p> : null}
        </form>
      </div>
    </section>
  )
}

function normalizeSectionFields(value) {
  return {
    imageUrl: String(value?.imageUrl || ''),
  }
}

function normalizeRummyRows(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        id: 'rummy-item-default-1',
        question: '',
        answer: '',
      },
    ]
  }

  return value.map((row, index) => ({
    id: String(row.id || `rummy-item-${index + 1}`),
    question: String(row.question || ''),
    answer: String(row.answer || ''),
  }))
}

export default RummySectionSettingsSection