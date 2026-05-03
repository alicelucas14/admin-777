
import { useMemo, useState } from 'react'

function PromotionSection({
  promotions,
  onCreatePromotion,
  onUpdatePromotion,
  onDeletePromotion,
  onBulkAction,
}) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    writeUp: '',
    status: 'Published',
    imageUrl: '',
  })

  const filteredPromotions = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return promotions
    }

    return promotions.filter((promotion) => {
      const slug = promotion.slug || slugify(promotion.title)
      return (
        String(promotion.id).includes(normalized) ||
        promotion.title.toLowerCase().includes(normalized) ||
        slug.includes(normalized)
      )
    })
  }, [promotions, query])

  const allVisibleSelected =
    filteredPromotions.length > 0 &&
    filteredPromotions.every((promotion) => selectedIds.includes(promotion.id))

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = filteredPromotions.map((promotion) => promotion.id)
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedIds((current) => {
      const next = new Set(current)
      filteredPromotions.forEach((promotion) => next.add(promotion.id))
      return Array.from(next)
    })
  }

  const handleSelectOne = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const openCreateForm = () => {
    setEditingId(null)
    setSubmitError('')
    setFormData({
      title: '',
      writeUp: '',
      status: 'Published',
      imageUrl: '',
    })
    setShowForm(true)
  }

  const openEditForm = (promotion) => {
    setEditingId(promotion.id)
    setSubmitError('')
    setFormData({
      title: promotion.title,
      writeUp: promotion.writeUp || promotion.description || '',
      status: normalizeStatus(promotion.status),
      imageUrl: promotion.imageUrl || '',
    })
    setShowForm(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!formData.title.trim()) {
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        title: formData.title.trim(),
        writeUp: formData.writeUp.trim(),
        description: formData.writeUp.trim(),
        status: formData.status,
        imageUrl: formData.imageUrl.trim(),
      }

      if (editingId) {
        await onUpdatePromotion(editingId, payload)
      } else {
        await onCreatePromotion(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ title: '', writeUp: '', status: 'Published', imageUrl: '' })
    } catch {
      setSubmitError('Could not save promotion. Please check backend connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setSubmitError('')
    setIsSaving(true)
    try {
      await onDeletePromotion(id)
      setSelectedIds((current) => current.filter((item) => item !== id))
    } catch {
      setSubmitError('Could not delete promotion. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) {
      return
    }

    setSubmitError('')
    setIsSaving(true)
    try {
      await onBulkAction({
        ids: selectedIds,
        action: bulkAction,
      })
      setSelectedIds([])
      setBulkAction('')
    } catch {
      setSubmitError('Could not apply bulk action. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const encoded = await toDataUrl(file)
      setFormData((current) => ({ ...current, imageUrl: encoded }))
      setSubmitError('')
    } catch {
      setSubmitError('Image upload failed. Please choose a different image.')
    }
  }

  return (
    <section id="promotions-admin" className="section-block games-admin-panel promotions-admin-panel">
      <h2 className="games-title">Promotions</h2>

      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Manage Promotions</h3>
            <p>View, edit, and manage all your content in one place.</p>
          </div>
          <button type="button" className="games-create-button" onClick={openCreateForm}>
            + Create New
          </button>
        </div>

        {showForm ? (
          <form className="games-editor-form" onSubmit={handleSave}>
            <input
              type="text"
              placeholder="Promotion title"
              value={formData.title}
              onChange={(event) =>
                setFormData((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
            <input
              type="url"
              placeholder="Image URL"
              value={formData.imageUrl}
              onChange={(event) =>
                setFormData((current) => ({ ...current, imageUrl: event.target.value }))
              }
            />
            <textarea
              className="promotions-editor-textarea"
              placeholder="Promotion content paragraph"
              value={formData.writeUp}
              onChange={(event) =>
                setFormData((current) => ({ ...current, writeUp: event.target.value }))
              }
              rows={7}
            />
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleImageFile}
            />
            <select
              value={formData.status}
              onChange={(event) =>
                setFormData((current) => ({ ...current, status: event.target.value }))
              }
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>

            <div className="games-editor-actions">
              <button type="submit" className="games-action-save" disabled={isSaving}>
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setSubmitError('')
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
            {submitError ? <p className="games-form-error">{submitError}</p> : null}
          </form>
        ) : null}

        <div className="games-search-row">
          <input
            type="search"
            placeholder="Search by name, ID, or slug..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="games-bulk-row">
          <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
            <option value="">Bulk Actions</option>
            <option value="Published">Mark Published</option>
            <option value="Draft">Mark Draft</option>
            <option value="Archived">Mark Archived</option>
            <option value="delete">Delete</option>
          </select>
          <button type="button" onClick={handleBulkApply} disabled={isSaving}>
            Apply
          </button>
        </div>

        <div className="games-table">
          <div className="games-table-head promotions-table-head">
            <label>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAllVisible}
                aria-label="Select all promotions"
              />
            </label>
            <span>Image</span>
            <span>Title / Name</span>
            <span>Status</span>
            <span>Last Updated</span>
          </div>

          {filteredPromotions.map((promotion) => {
            const status = normalizeStatus(promotion.status)
            const lastUpdated = formatDate(promotion.updatedAt)
            const slug = promotion.slug || slugify(promotion.title)
            const isSelected = selectedIds.includes(promotion.id)

            return (
              <div className="games-table-row promotions-table-row" key={promotion.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(promotion.id)}
                    aria-label={`Select ${promotion.title}`}
                    disabled={isSaving}
                  />
                </label>

                <div className="games-thumb-wrap">
                  {promotion.imageUrl ? (
                    <img src={promotion.imageUrl} alt={promotion.title} className="games-thumb" />
                  ) : (
                    <div className="games-thumb games-thumb--placeholder">
                      {initials(promotion.title)}
                    </div>
                  )}
                </div>

                <div className="games-name-col">
                  <strong>{promotion.title}</strong>
                  <span>{slug}</span>
                  {promotion.writeUp ? <p>{truncateText(promotion.writeUp)}</p> : null}
                  <div className="promotion-inline-actions">
                    <button
                      type="button"
                      className="games-link-edit"
                      onClick={() => openEditForm(promotion)}
                      disabled={isSaving}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="games-link-delete"
                      onClick={() => handleDelete(promotion.id)}
                      disabled={isSaving}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div>
                  <span className={`games-status games-status--${status.toLowerCase()}`}>{status}</span>
                </div>

                <span className="games-date">{lastUpdated}</span>
              </div>
            )
          })}

          {filteredPromotions.length === 0 ? (
            <p className="games-empty-state">No content found.</p>
          ) : null}
        </div>

        {!showForm && submitError ? <p className="games-form-error">{submitError}</p> : null}
      </div>
    </section>
  )
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('file_read_failed'))
    reader.readAsDataURL(file)
  })
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function initials(value) {
  const chars = String(value)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  return chars || 'PR'
}

function truncateText(value) {
  const text = String(value || '').trim()
  if (text.length <= 90) {
    return text
  }

  return `${text.slice(0, 87).trim()}...`
}

function normalizeStatus(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'live' || normalized === 'published') {
    return 'Published'
  }
  if (normalized === 'beta' || normalized === 'draft') {
    return 'Draft'
  }
  return 'Archived'
}

export default PromotionSection
