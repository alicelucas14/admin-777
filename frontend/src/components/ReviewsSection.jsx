import { useMemo, useState } from 'react'

function ReviewsSection({ reviews, onCreateReview, onUpdateReview, onDeleteReview, onBulkAction }) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    user: '',
    rating: 5,
    comment: '',
    imageUrl: '',
    status: 'Published',
  })

  const filteredReviews = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return reviews
    }

    return reviews.filter((review) => {
      return (
        String(review.id).includes(normalized) ||
        String(review.user || '').toLowerCase().includes(normalized) ||
        String(review.comment || '').toLowerCase().includes(normalized)
      )
    })
  }, [reviews, query])

  const allVisibleSelected =
    filteredReviews.length > 0 && filteredReviews.every((review) => selectedIds.includes(review.id))

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = filteredReviews.map((review) => review.id)
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedIds((current) => {
      const next = new Set(current)
      filteredReviews.forEach((review) => next.add(review.id))
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
    setFormData({ user: '', rating: 5, comment: '', imageUrl: '', status: 'Published' })
    setShowForm(true)
  }

  const openEditForm = (review) => {
    setEditingId(review.id)
    setSubmitError('')
    setFormData({
      user: review.user || '',
      rating: normalizeRating(review.rating),
      comment: review.comment || '',
      imageUrl: review.imageUrl || '',
      status: normalizeStatus(review.status),
    })
    setShowForm(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!formData.user.trim() || !formData.comment.trim()) {
      return
    }

    const payload = {
      user: formData.user.trim(),
      rating: Number(formData.rating) || 5,
      comment: formData.comment.trim(),
      imageUrl: formData.imageUrl.trim(),
      status: formData.status,
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await onUpdateReview(editingId, payload)
      } else {
        await onCreateReview(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ user: '', rating: 5, comment: '', imageUrl: '', status: 'Published' })
    } catch {
      setSubmitError('Could not save review. Please check backend connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setSubmitError('')
    setIsSaving(true)
    try {
      await onDeleteReview(id)
      setSelectedIds((current) => current.filter((item) => item !== id))
    } catch {
      setSubmitError('Could not delete review. Please try again.')
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
    <section id="reviews-admin" className="section-block games-admin-panel reviews-admin-panel">
      <h2 className="games-title">Reviews</h2>

      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Manage Reviews</h3>
            <p>View, edit, and moderate player reviews in one place.</p>
          </div>
          <button type="button" className="games-create-button" onClick={openCreateForm}>
            + Create New
          </button>
        </div>

        {showForm ? (
          <form className="games-editor-form" onSubmit={handleSave}>
            <input
              type="text"
              placeholder="Reviewer name"
              value={formData.user}
              onChange={(event) =>
                setFormData((current) => ({ ...current, user: event.target.value }))
              }
              required
            />
            <select
              value={formData.rating}
              onChange={(event) =>
                setFormData((current) => ({ ...current, rating: Number(event.target.value) }))
              }
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
            <textarea
              placeholder="Review comment"
              value={formData.comment}
              onChange={(event) =>
                setFormData((current) => ({ ...current, comment: event.target.value }))
              }
              rows={3}
              required
            />
            <input
              type="url"
              placeholder="Reviewer image URL"
              value={formData.imageUrl}
              onChange={(event) =>
                setFormData((current) => ({ ...current, imageUrl: event.target.value }))
              }
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
            placeholder="Search by id, name, or comment..."
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
          <div className="games-table-head reviews-table-head">
            <label>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAllVisible}
                aria-label="Select all reviews"
              />
            </label>
            <span>Reviewer</span>
            <span>Icon</span>
            <span>Comment</span>
            <span>Rating</span>
            <span>Status</span>
            <span>Last Updated</span>
          </div>

          {filteredReviews.map((review) => {
            const status = normalizeStatus(review.status)
            const lastUpdated = formatDate(review.updatedAt || review.date)
            const isSelected = selectedIds.includes(review.id)

            return (
              <div className="games-table-row reviews-table-row" key={review.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(review.id)}
                    aria-label={`Select review by ${review.user}`}
                    disabled={isSaving}
                  />
                </label>

                <div className="games-name-col">
                  <strong>{review.user}</strong>
                  <span>#{review.id}</span>
                  <div className="promotion-inline-actions">
                    <button
                      type="button"
                      className="games-link-edit"
                      onClick={() => openEditForm(review)}
                      disabled={isSaving}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="games-link-delete"
                      onClick={() => handleDelete(review.id)}
                      disabled={isSaving}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="review-icon-cell">
                  {review.imageUrl ? (
                    <img src={review.imageUrl} alt={review.user} className="review-icon-thumb" />
                  ) : (
                    <div className="review-icon-thumb review-icon-thumb--placeholder">
                      {initials(review.user)}
                    </div>
                  )}
                </div>

                <p className="reviews-comment-cell">{truncateText(review.comment, 140)}</p>
                <span className="reviews-rating-cell">{normalizeRating(review.rating)} / 5</span>
                <div>
                  <span className={`games-status games-status--${status.toLowerCase()}`}>{status}</span>
                </div>
                <span className="games-date">{lastUpdated}</span>
              </div>
            )
          })}

          {filteredReviews.length === 0 ? <p className="games-empty-state">No reviews found.</p> : null}
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

function initials(value) {
  const chars = String(value)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  return chars || 'RV'
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

function normalizeRating(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 5
  }

  return Math.max(1, Math.min(5, Math.round(numeric)))
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

function truncateText(value, maxLength) {
  const text = String(value || '').trim()
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

export default ReviewsSection
