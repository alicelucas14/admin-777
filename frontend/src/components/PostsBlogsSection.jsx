import { useMemo, useRef, useState } from 'react'
import { parseBlogContentBlocks, parseInlineMarkdown } from '../utils/blogContent'
import {
  IMAGE_UPLOAD_ACCEPT,
  SUPPORTED_IMAGE_FORMATS_LABEL,
  SUPPORTED_IMAGE_MIME_TYPES,
} from '../utils/imageUpload'

const ALLOWED_IMAGE_MIME_TYPES = new Set(SUPPORTED_IMAGE_MIME_TYPES)
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024

function PostsBlogsSection({
  postsBlogs,
  onUploadImage,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onBulkAction,
}) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingIconImage, setIsUploadingIconImage] = useState(false)
  const [isUploadingContentImage, setIsUploadingContentImage] = useState(false)
  const writeUpTextareaRef = useRef(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: '',
    writeUp: '',
    status: 'Published',
    imageUrl: '',
  })
  const [contentImageUrl, setContentImageUrl] = useState('')

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return postsBlogs
    }

    return postsBlogs.filter((post) => {
      const slug = post.slug || slugify(post.title)
      return (
        String(post.id).includes(normalized) ||
        post.title.toLowerCase().includes(normalized) ||
        slug.includes(normalized)
      )
    })
  }, [postsBlogs, query])

  const allVisibleSelected =
    filteredPosts.length > 0 && filteredPosts.every((post) => selectedIds.includes(post.id))

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = filteredPosts.map((post) => post.id)
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedIds((current) => {
      const next = new Set(current)
      filteredPosts.forEach((post) => next.add(post.id))
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
    setContentImageUrl('')
    setFormData({
      title: '',
      category: '',
      author: '',
      writeUp: '',
      status: 'Published',
      imageUrl: '',
    })
    setShowForm(true)
  }

  const openEditForm = (post) => {
    setEditingId(post.id)
    setSubmitError('')
    setContentImageUrl('')
    setFormData({
      title: post.title,
      category: post.category || '',
      author: post.author || '',
      writeUp: post.writeUp || post.description || '',
      status: normalizeStatus(post.status),
      imageUrl: post.imageUrl || '',
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
      category: formData.category.trim(),
      author: formData.author.trim(),
      writeUp: formData.writeUp.trim(),
      description: formData.writeUp.trim(),
      status: formData.status,
      imageUrl: formData.imageUrl.trim(),
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await onUpdatePost(editingId, payload)
      } else {
        await onCreatePost(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setContentImageUrl('')
      setFormData({
        title: '',
        category: '',
        author: '',
        writeUp: '',
        status: 'Published',
        imageUrl: '',
      })
    } catch {
      setSubmitError('Could not save blog post. Please check backend connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setSubmitError('')
    setIsSaving(true)
    try {
      await onDeletePost(id)
      setSelectedIds((current) => current.filter((item) => item !== id))
    } catch {
      setSubmitError('Could not delete blog post. Please try again.')
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

  const handleIconImageFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const validationMessage = validateUploadFile(file)
    if (validationMessage) {
      setSubmitError(validationMessage)
      event.target.value = ''
      return
    }

    setIsUploadingIconImage(true)
    try {
      const uploadedImageUrl = await onUploadImage(file)
      setFormData((current) => ({ ...current, imageUrl: uploadedImageUrl }))
      setSubmitError('')
    } catch (caughtError) {
      setSubmitError(resolveUploadErrorMessage(caughtError, 'Icon image'))
    } finally {
      event.target.value = ''
      setIsUploadingIconImage(false)
    }
  }

  const handleContentImageFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const validationMessage = validateUploadFile(file)
    if (validationMessage) {
      setSubmitError(validationMessage)
      event.target.value = ''
      return
    }

    setIsUploadingContentImage(true)
    try {
      const uploadedImageUrl = await onUploadImage(file)
      setContentImageUrl(uploadedImageUrl)
      setSubmitError('')
    } catch (caughtError) {
      setSubmitError(resolveUploadErrorMessage(caughtError, 'Content image'))
    } finally {
      event.target.value = ''
      setIsUploadingContentImage(false)
    }
  }

  const handleInsertImageBlock = () => {
    const imageUrl = String(contentImageUrl || '').trim()

    if (!imageUrl) {
      setSubmitError('Add or upload a content image first, then insert it into the blog content.')
      return
    }

    const altText = String(formData.title || 'Blog image').trim() || 'Blog image'
    const imageBlock = `![${altText}](${imageUrl})`

    setFormData((current) => {
      const currentWriteUp = String(current.writeUp || '').trim()
      return {
        ...current,
        writeUp: currentWriteUp ? `${currentWriteUp}\n\n${imageBlock}` : imageBlock,
      }
    })
    setSubmitError('')
  }

  const withTextareaSelection = (formatter) => {
    const textarea = writeUpTextareaRef.current
    if (!textarea) {
      return
    }

    const currentText = String(formData.writeUp || '')
    const selectionStart = textarea.selectionStart ?? 0
    const selectionEnd = textarea.selectionEnd ?? selectionStart
    const selectedText = currentText.slice(selectionStart, selectionEnd)
    const result = formatter({
      currentText,
      selectedText,
      selectionStart,
      selectionEnd,
    })

    if (!result) {
      return
    }

    setFormData((current) => ({
      ...current,
      writeUp: result.nextText,
    }))
    setSubmitError('')

    requestAnimationFrame(() => {
      const nextTextarea = writeUpTextareaRef.current
      if (!nextTextarea) {
        return
      }

      nextTextarea.focus()
      nextTextarea.setSelectionRange(result.nextSelectionStart, result.nextSelectionEnd)
    })
  }

  const handleMakeBold = () => {
    withTextareaSelection(({ currentText, selectedText, selectionStart, selectionEnd }) => {
      const textToFormat = selectedText || 'Bold text'
      const wrappedText = `**${textToFormat}**`

      return {
        nextText: `${currentText.slice(0, selectionStart)}${wrappedText}${currentText.slice(selectionEnd)}`,
        nextSelectionStart: selectionStart + 2,
        nextSelectionEnd: selectionStart + 2 + textToFormat.length,
      }
    })
  }

  const handleAddLink = () => {
    const textarea = writeUpTextareaRef.current
    if (!textarea) {
      return
    }

    const currentText = String(formData.writeUp || '')
    const selectionStart = textarea.selectionStart ?? 0
    const selectionEnd = textarea.selectionEnd ?? selectionStart
    const selectedText = currentText.slice(selectionStart, selectionEnd).trim()

    if (!selectedText) {
      setSubmitError('Highlight the text you want to turn into a link first.')
      textarea.focus()
      return
    }

    const inputUrl = window.prompt('Enter the link URL', 'https://')

    if (inputUrl === null) {
      textarea.focus()
      return
    }

    const normalizedUrl = String(inputUrl).trim()

    if (!normalizedUrl) {
      setSubmitError('Add a valid link URL to create the link.')
      textarea.focus()
      return
    }

    withTextareaSelection(({ currentText: latestText, selectionStart: latestStart, selectionEnd: latestEnd }) => {
      const latestSelectedText = latestText.slice(latestStart, latestEnd) || selectedText
      const linkedText = `[${latestSelectedText}](${normalizedUrl})`

      return {
        nextText: `${latestText.slice(0, latestStart)}${linkedText}${latestText.slice(latestEnd)}`,
        nextSelectionStart: latestStart + 1,
        nextSelectionEnd: latestStart + 1 + latestSelectedText.length,
      }
    })
  }

  const handleAlignCenter = () => {
    const textarea = writeUpTextareaRef.current
    if (!textarea) {
      return
    }

    const currentText = String(formData.writeUp || '')
    const selectionStart = textarea.selectionStart ?? 0
    const selectionEnd = textarea.selectionEnd ?? selectionStart
    const selectedText = currentText.slice(selectionStart, selectionEnd).trim()

    if (!selectedText) {
      setSubmitError('Highlight the text you want to center first.')
      textarea.focus()
      return
    }

    withTextareaSelection(({ currentText: latestText, selectionStart: latestStart, selectionEnd: latestEnd }) => {
      const latestSelectedText = latestText.slice(latestStart, latestEnd).trim() || selectedText
      const centeredBlock = `[center]${latestSelectedText}[/center]`
      const prefix = latestStart > 0 && !/\n\s*\n$/.test(latestText.slice(0, latestStart)) ? '\n\n' : ''
      const suffix = latestEnd < latestText.length && !/^\s*\r?\n\r?\n/.test(latestText.slice(latestEnd)) ? '\n\n' : ''
      const replacement = `${prefix}${centeredBlock}${suffix}`

      return {
        nextText: `${latestText.slice(0, latestStart)}${replacement}${latestText.slice(latestEnd)}`,
        nextSelectionStart: latestStart + prefix.length + 8,
        nextSelectionEnd: latestStart + prefix.length + 8 + latestSelectedText.length,
      }
    })
  }

  const contentPreviewBlocks = useMemo(
    () => parseBlogContentBlocks(formData.writeUp || ''),
    [formData.writeUp],
  )

  return (
    <section id="blog-posts-admin" className="section-block games-admin-panel blog-posts-admin-panel">
      <h2 className="games-title">Blog Posts</h2>

      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Manage Blog Posts</h3>
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
              placeholder="Post title"
              value={formData.title}
              onChange={(event) =>
                setFormData((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(event) =>
                setFormData((current) => ({ ...current, category: event.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Author"
              value={formData.author}
              onChange={(event) =>
                setFormData((current) => ({ ...current, author: event.target.value }))
              }
            />
            <textarea
              ref={writeUpTextareaRef}
              className="blog-posts-editor-textarea"
              placeholder="Content paragraphs. Use the button below to insert the current image into the content between paragraphs."
              value={formData.writeUp}
              onChange={(event) =>
                setFormData((current) => ({ ...current, writeUp: event.target.value }))
              }
              rows={8}
            />
            <div className="blog-editor-toolbar" role="toolbar" aria-label="Blog content formatting">
              <button
                type="button"
                className="blog-editor-toolbar-button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleMakeBold}
              >
                Bold
              </button>
              <button
                type="button"
                className="blog-editor-toolbar-button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleAddLink}
              >
                Add Link
              </button>
              <button
                type="button"
                className="blog-editor-toolbar-button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleAlignCenter}
              >
                Center
              </button>
            </div>
            <div className="blog-image-field-group">
              <strong>Post Icon Image</strong>
              <p>This image is used as the blog card or post thumbnail.</p>
              <input
                type="text"
                placeholder="Post icon image URL or /uploads path"
                value={formData.imageUrl}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
              <input
                type="file"
                accept={IMAGE_UPLOAD_ACCEPT}
                onChange={handleIconImageFile}
                disabled={isUploadingIconImage || isSaving}
              />
              {isUploadingIconImage ? <p className="games-form-hint">Uploading post icon...</p> : null}
            </div>
            <div className="blog-image-field-group">
              <strong>Content Image</strong>
              <p>This image is only inserted inside the blog write-up.</p>
              <input
                type="text"
                placeholder="Content image URL or /uploads path"
                value={contentImageUrl}
                onChange={(event) => setContentImageUrl(event.target.value)}
              />
              <input
                type="file"
                accept={IMAGE_UPLOAD_ACCEPT}
                onChange={handleContentImageFile}
                disabled={isUploadingContentImage || isSaving}
              />
              <button
                type="button"
                onClick={handleInsertImageBlock}
                disabled={isUploadingContentImage || isSaving}
              >
                Insert Current Image Into Content
              </button>
              {isUploadingContentImage ? <p className="games-form-hint">Uploading content image...</p> : null}
            </div>
            {contentPreviewBlocks.length > 0 ? (
              <div className="blog-content-preview" aria-label="Blog content preview">
                <strong>Content Preview</strong>
                <div className="blog-content-preview-body">
                  {contentPreviewBlocks.map((block, index) => (
                    block.type === 'image' ? (
                      <figure className="blog-content-preview-media" key={`preview-image-${index}`}>
                        <img src={block.src} alt={block.alt} className="blog-content-preview-image" />
                      </figure>
                    ) : block.type === 'heading' ? (
                      <h4 key={`preview-heading-${index}`} className="blog-content-preview-heading">
                        {block.text}
                      </h4>
                    ) : block.type === 'centered' ? (
                      <p key={`preview-centered-${index}`} className="blog-content-preview-centered">
                        {renderInlineContent(block.text, `preview-centered-${index}`)}
                      </p>
                    ) : (
                      <p key={`preview-paragraph-${index}`}>
                        {renderInlineContent(block.text, `preview-paragraph-${index}`)}
                      </p>
                    )
                  ))}
                </div>
              </div>
            ) : null}
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
          <div className="games-table-head blog-posts-table-head">
            <label>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAllVisible}
                aria-label="Select all blog posts"
              />
            </label>
            <span>Image</span>
            <span>Title / Name</span>
            <span>Status</span>
            <span>Last Updated</span>
          </div>

          {filteredPosts.map((post) => {
            const status = normalizeStatus(post.status)
            const lastUpdated = formatDate(post.updatedAt || post.publishedAt)
            const slug = post.slug || slugify(post.title)
            const isSelected = selectedIds.includes(post.id)

            return (
              <div className="games-table-row blog-posts-table-row" key={post.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(post.id)}
                    aria-label={`Select ${post.title}`}
                    disabled={isSaving}
                  />
                </label>

                <div className="games-thumb-wrap">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="games-thumb" />
                  ) : (
                    <div className="games-thumb games-thumb--placeholder">{initials(post.title)}</div>
                  )}
                </div>

                <div className="games-name-col">
                  <strong>{post.title}</strong>
                  <span>{slug}</span>
                  <p>
                    {post.category || 'General'} • {post.author || 'Admin Team'}
                  </p>
                  <div className="promotion-inline-actions">
                    <button
                      type="button"
                      className="games-link-edit"
                      onClick={() => openEditForm(post)}
                      disabled={isSaving}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="games-link-delete"
                      onClick={() => handleDelete(post.id)}
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

          {filteredPosts.length === 0 ? <p className="games-empty-state">No content found.</p> : null}
        </div>

        {!showForm && submitError ? <p className="games-form-error">{submitError}</p> : null}
      </div>
    </section>
  )
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
  return chars || 'BP'
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

function validateUploadFile(file) {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(String(file?.type || '').toLowerCase())) {
    return `Only ${SUPPORTED_IMAGE_FORMATS_LABEL} images are allowed.`
  }

  if (Number(file?.size || 0) > MAX_UPLOAD_SIZE_BYTES) {
    return 'Image must be 5MB or smaller.'
  }

  return ''
}

function resolveUploadErrorMessage(error, label) {
  if (error instanceof Error && error.message && error.message !== 'games_request_failed') {
    return `${label} upload failed: ${error.message}`
  }

  return `${label} upload failed. Please check backend upload support and try again.`
}

export default PostsBlogsSection

function renderInlineContent(text, keyPrefix) {
  return parseInlineMarkdown(text).map((token, index) => {
    const key = `${keyPrefix}-inline-${index}`

    if (token.type === 'bold') {
      return <strong key={key}>{token.text}</strong>
    }

    if (token.type === 'link') {
      const isExternal = /^https?:\/\//i.test(token.href)

      return (
        <a
          key={key}
          href={token.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {token.text}
        </a>
      )
    }

    return <span key={key}>{token.text}</span>
  })
}
