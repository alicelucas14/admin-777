function ContactMessagesSection({ submissions }) {
  const sortedSubmissions = [...(submissions || [])].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  )

  const handleExport = () => {
    const rows = sortedSubmissions.map((submission) => ({
      Date: formatDateTime(submission.createdAt),
      'First Name': submission.firstName || '',
      'Last Name': submission.lastName || '',
      Email: submission.email || '',
      Message: submission.message || '',
      Location: submission.location || '',
      Status: submission.emailSent
        ? 'Email sent, Escalated to a support specialist'
        : 'Escalated to a support specialist',
    }))

    downloadCsv(rows, `contact-messages-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <section id="contact-messages" className="section-block games-admin-panel messages-admin-panel">
      <h2 className="games-title">Messages</h2>
      <div className="games-manage-card">
        <div className="games-manage-header">
          <div>
            <h3>Contact Form Messages</h3>
            <p>View submitted contact messages and export them for Excel.</p>
          </div>
          <button
            type="button"
            className="games-create-button"
            onClick={handleExport}
            disabled={sortedSubmissions.length === 0}
          >
            Export CSV
          </button>
        </div>

        {sortedSubmissions.length ? (
          <div className="messages-table">
            <div className="messages-table-head">
              <span>Date</span>
              <span>First Name</span>
              <span>Last Name</span>
              <span>Email</span>
              <span>Status</span>
            </div>
            {sortedSubmissions.map((submission) => (
              <article className="messages-table-row" key={submission.id || submission.createdAt}>
                <span>{formatDateTime(submission.createdAt)}</span>
                <strong>{submission.firstName || '-'}</strong>
                <strong>{submission.lastName || '-'}</strong>
                <a href={`mailto:${submission.email}`}>{submission.email || '-'}</a>
                <span className="messages-status">
                  {submission.emailSent
                    ? 'Email sent, Escalated to a support specialist'
                    : 'Escalated to a support specialist'}
                </span>
                <p>{truncateText(submission.message || '-', 160)}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="dashboard-empty">No contact messages have been sent yet.</p>
        )}
      </div>
    </section>
  )
}

function downloadCsv(rows, filename) {
  const headers = rows[0] ? Object.keys(rows[0]) : []
  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function csvEscape(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function truncateText(value, maxLength) {
  const text = String(value || '').trim()
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

export default ContactMessagesSection
