import { useMemo, useState } from 'react'

function GamesSection({ games, onCreateGame, onUpdateGame, onDeleteGame, onBulkAction }) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    writeUp: '',
    status: 'Published',
    imageUrl: '',
  })

  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return games
    }

    return games.filter((game) => {
      const slug = game.slug || slugify(game.title)
      return (
        String(game.id).includes(normalized) ||
        game.title.toLowerCase().includes(normalized) ||
        slug.includes(normalized)
      )
    })
  }, [games, query])

  const allVisibleSelected =
    filteredGames.length > 0 &&
    filteredGames.every((game) => selectedIds.includes(game.id))

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = filteredGames.map((game) => game.id)
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedIds((current) => {
      const next = new Set(current)
      filteredGames.forEach((game) => next.add(game.id))
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
      genre: '',
      writeUp: '',
      status: 'Published',
      imageUrl: '',
    })
    setShowForm(true)
  }

  const openEditForm = (game) => {
    setEditingId(game.id)
    setSubmitError('')
    setFormData({
      title: game.title,
      genre: game.genre || '',
      writeUp: game.writeUp || game.description || '',
      status: normalizeStatus(game.status),
      imageUrl: game.imageUrl || '',
    })
    setShowForm(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!formData.title.trim()) {
      return
    }

    const payload = {
      title: formData.title.trim(),
      genre: formData.genre.trim(),
      writeUp: formData.writeUp.trim(),
      description: formData.writeUp.trim(),
      status: formData.status,
      imageUrl: formData.imageUrl.trim(),
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await onUpdateGame(editingId, payload)
      } else {
        await onCreateGame(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ title: '', genre: '', writeUp: '', status: 'Published', imageUrl: '' })
    } catch {
      setSubmitError('Could not save game. Please check backend connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setSubmitError('')
    setIsSaving(true)
    try {
      await onDeleteGame(id)
      setSelectedIds((current) => current.filter((item) => item !== id))
    } catch {
      setSubmitError('Could not delete game. Please try again.')
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
    <section id="games" className="section-block games-admin-panel">
      <h2 className="games-title">Games</h2>

      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Manage Games</h3>
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
              placeholder="Game title"
              value={formData.title}
              onChange={(event) =>
                setFormData((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
            <input
              type="text"
              placeholder="Genre"
              value={formData.genre}
              onChange={(event) =>
                setFormData((current) => ({ ...current, genre: event.target.value }))
              }
            />
            <textarea
              placeholder="Game write-up"
              value={formData.writeUp}
              onChange={(event) =>
                setFormData((current) => ({ ...current, writeUp: event.target.value }))
              }
              rows={3}
            />
            <input
              type="url"
              placeholder="Image URL"
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
          <div className="games-table-head">
            <label>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAllVisible}
                aria-label="Select all games"
              />
            </label>
            <span>Image</span>
            <span>Title / Name</span>
            <span>Status</span>
            <span>Last Updated</span>
            <span>Actions</span>
          </div>

          {filteredGames.map((game) => {
            const status = normalizeStatus(game.status)
            const lastUpdated = formatDate(game.updatedAt)
            const slug = game.slug || slugify(game.title)
            const isSelected = selectedIds.includes(game.id)

            return (
              <div className="games-table-row" key={game.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(game.id)}
                    aria-label={`Select ${game.title}`}
                    disabled={isSaving}
                  />
                </label>

                <div className="games-thumb-wrap">
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt={game.title} className="games-thumb" />
                  ) : (
                    <div className="games-thumb games-thumb--placeholder">{initials(game.title)}</div>
                  )}
                </div>

                <div className="games-name-col">
                  <strong>{game.title}</strong>
                  <span>{slug}</span>
                  {game.writeUp || game.description ? <p>{truncateText(game.writeUp || game.description, 140)}</p> : null}
                </div>

                <div>
                  <span className={`games-status games-status--${status.toLowerCase()}`}>{status}</span>
                </div>

                <span className="games-date">{lastUpdated}</span>

                <div className="games-row-actions">
                  <button
                    type="button"
                    className="games-link-edit"
                    onClick={() => openEditForm(game)}
                    disabled={isSaving}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="games-link-delete"
                    onClick={() => handleDelete(game.id)}
                    disabled={isSaving}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}

          {filteredGames.length === 0 ? (
            <p className="games-empty-state">No games found for this search.</p>
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
  return chars || 'GM'
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

function truncateText(value, maxLength) {
  const text = String(value || '').trim()
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

export default GamesSection
