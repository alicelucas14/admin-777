import { useMemo, useState } from 'react'

function FaqSection({ faqs, onCreateFaq, onUpdateFaq, onDeleteFaq, onBulkAction }) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    status: 'Published',
  })

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return faqs
    }

    return faqs.filter((faq) => {
      return (
        String(faq.id).includes(normalized) ||
        String(faq.question || '').toLowerCase().includes(normalized) ||
        String(faq.answer || '').toLowerCase().includes(normalized)
      )
    })
  }, [faqs, query])

  const allVisibleSelected =
    filteredFaqs.length > 0 && filteredFaqs.every((faq) => selectedIds.includes(faq.id))

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = filteredFaqs.map((faq) => faq.id)
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedIds((current) => {
      const next = new Set(current)
      filteredFaqs.forEach((faq) => next.add(faq.id))
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
      question: '',
      answer: '',
      status: 'Published',
    })
    setShowForm(true)
  }

  const openEditForm = (faq) => {
    setEditingId(faq.id)
    setSubmitError('')
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      status: normalizeStatus(faq.status),
    })
    setShowForm(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!formData.question.trim() || !formData.answer.trim()) {
      return
    }

    const payload = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      status: formData.status,
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await onUpdateFaq(editingId, payload)
      } else {
        await onCreateFaq(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ question: '', answer: '', status: 'Published' })
    } catch {
      setSubmitError('Could not save FAQ item. Please check backend connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setSubmitError('')
    setIsSaving(true)
    try {
      await onDeleteFaq(id)
      setSelectedIds((current) => current.filter((item) => item !== id))
    } catch {
      setSubmitError('Could not delete FAQ item. Please try again.')
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

  return (
    <section id="faqs-admin" className="section-block games-admin-panel faqs-admin-panel">
      <h2 className="games-title">FAQ</h2>

      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Manage FAQ</h3>
            <p>Add, edit, and publish frequently asked questions.</p>
          </div>
          <button type="button" className="games-create-button" onClick={openCreateForm}>
            + Create New
          </button>
        </div>

        {showForm ? (
          <form className="games-editor-form" onSubmit={handleSave}>
            <input
              type="text"
              placeholder="Question"
              value={formData.question}
              onChange={(event) =>
                setFormData((current) => ({ ...current, question: event.target.value }))
              }
              required
            />
            <textarea
              className="faqs-editor-textarea"
              placeholder="Answer"
              value={formData.answer}
              onChange={(event) =>
                setFormData((current) => ({ ...current, answer: event.target.value }))
              }
              rows={6}
              required
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
            placeholder="Search by id, question, or answer..."
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
          <div className="games-table-head faqs-table-head">
            <label>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAllVisible}
                aria-label="Select all faqs"
              />
            </label>
            <span>Question</span>
            <span>Answer</span>
            <span>Status</span>
            <span>Last Updated</span>
          </div>

          {filteredFaqs.map((faq) => {
            const status = normalizeStatus(faq.status)
            const lastUpdated = formatDate(faq.updatedAt)
            const isSelected = selectedIds.includes(faq.id)

            return (
              <div className="games-table-row faqs-table-row" key={faq.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(faq.id)}
                    aria-label={`Select faq ${faq.id}`}
                    disabled={isSaving}
                  />
                </label>

                <div className="games-name-col">
                  <strong>{faq.question}</strong>
                  <span>#{faq.id}</span>
                  <div className="promotion-inline-actions">
                    <button
                      type="button"
                      className="games-link-edit"
                      onClick={() => openEditForm(faq)}
                      disabled={isSaving}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="games-link-delete"
                      onClick={() => handleDelete(faq.id)}
                      disabled={isSaving}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="faqs-answer-cell">{truncateText(faq.answer, 140)}</p>

                <div>
                  <span className={`games-status games-status--${status.toLowerCase()}`}>{status}</span>
                </div>

                <span className="games-date">{lastUpdated}</span>
              </div>
            )
          })}

          {filteredFaqs.length === 0 ? <p className="games-empty-state">No FAQ items found.</p> : null}
        </div>

        {!showForm && submitError ? <p className="games-form-error">{submitError}</p> : null}
      </div>
    </section>
  )
}

export default FaqSection

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
