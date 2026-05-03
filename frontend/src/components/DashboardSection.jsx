function DashboardSection({ dashboard, loading, error }) {
  const recentLogins = dashboard?.adminLogins?.recent || []
  const recentVisitors = dashboard?.visitorStats?.recentVisitors || []
  const recentSubmissions = dashboard?.contactSubmissions?.recent || []
  const seo = dashboard?.seo || {}

  return (
    <section id="dashboard" className="section-block dashboard-admin-panel">
      <h2>Admin</h2>
      {loading ? <p className="lead-copy">Loading admin data...</p> : null}
      {error ? <p className="status error">{error}</p> : null}
      <div className="metric-strip">
        <div className="metric-item">
          <span>Unique Visitors</span>
          <strong>{dashboard?.uniqueVisitors ?? '-'}</strong>
        </div>
        <div className="metric-item">
          <span>Today&apos;s Visitors</span>
          <strong>{dashboard?.todayUniqueVisitors ?? '-'}</strong>
        </div>
        <div className="metric-item">
          <span>Total Visits</span>
          <strong>{dashboard?.totalVisits ?? '-'}</strong>
        </div>
        <div className="metric-item">
          <span>Contact Messages</span>
          <strong>{dashboard?.contactSubmissionCount ?? '-'}</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Admin Login Activity</h3>
            <span>{dashboard?.adminLoginCount ?? 0} total</span>
          </div>
          <DashboardTable
            emptyText="No admin logins recorded yet."
            rows={recentLogins}
            renderRow={(login) => (
              <>
                <strong>{login.username || 'Admin'}</strong>
                <span>{login.location || 'Unknown location'}</span>
                <span>{login.ip || 'Unknown IP'}</span>
                <span>{formatDateTime(login.loggedAt)}</span>
              </>
            )}
          />
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Recent Visitors</h3>
            <span>{dashboard?.visitorStats?.uniqueVisitors ?? 0} unique</span>
          </div>
          <DashboardTable
            emptyText="No visitor activity recorded yet."
            rows={recentVisitors}
            renderRow={(visitor) => (
              <>
                <strong>{visitor.location || 'Unknown location'}</strong>
                <span>{visitor.path || '/'}</span>
                <span>{visitor.visits || 1} visits</span>
                <span>{formatDateTime(visitor.lastSeenAt)}</span>
              </>
            )}
          />
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Recent Contact Messages</h3>
            <span>{dashboard?.contactSubmissions?.total ?? 0} total</span>
          </div>
          <DashboardTable
            emptyText="No contact messages yet."
            rows={recentSubmissions}
            renderRow={(submission) => (
              <>
                <strong>
                  {submission.firstName} {submission.lastName}
                </strong>
                <span>{submission.email}</span>
                <span>{submission.emailSent ? 'Email sent' : 'Saved only'}</span>
                <span>{formatDateTime(submission.createdAt)}</span>
              </>
            )}
          />
        </article>

        <article className="dashboard-card dashboard-seo-card">
          <div className="dashboard-card-header">
            <h3>SEO Overview</h3>
            <span>{seo.title ? 'Configured' : 'Needs setup'}</span>
          </div>
          <dl className="dashboard-seo-list">
            <div>
              <dt>Title</dt>
              <dd>{seo.title || 'Not set'}</dd>
            </div>
            <div>
              <dt>Description</dt>
              <dd>{seo.description || 'Not set'}</dd>
            </div>
            <div>
              <dt>Keywords</dt>
              <dd>{seo.keywords || 'Not set'}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  )
}

function DashboardTable({ rows, renderRow, emptyText }) {
  if (!rows.length) {
    return <p className="dashboard-empty">{emptyText}</p>
  }

  return (
    <div className="dashboard-table">
      {rows.map((row) => (
        <div className="dashboard-table-row" key={row.id || row.visitorId || row.createdAt}>
          {renderRow(row)}
        </div>
      ))}
    </div>
  )
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

export default DashboardSection
