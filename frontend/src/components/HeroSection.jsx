function HeroSection({ loading, error }) {
  const heroImageUrl = '/hero1.webp?v=20260508-1303'

  return (
    <section id="how-to-play" className="hero-banner">
      <picture className="hero-media" aria-hidden="true">
        <source srcSet={heroImageUrl} type="image/webp" sizes="100vw" />
        <img
          src={heroImageUrl}
          alt=""
          className="hero-media-image"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <div className="hero-content-box">
        <div className="hero-copy-section">
          <h1 className="hero-title">Stars777</h1>
          <p className="hero-subtitle">Winning is a Habit</p>
          <p className="hero-subtitle hero-subtitle--secondary">
            <span className="hero-subtitle-accent">Stars</span> yours today
          </p>
          <p className="hero-description">
            Ride the multiplier, cash out at the perfect moment, and
            feel the rush of a premium real-time Aviator game.
          </p>
          {loading && <div className="status">Loading the latest games...</div>}
          {error ? <div className="status error">{error}</div> : null}
        </div>
        <div className="hero-actions-section">
          <div className="hero-actions">
            <a
              className="hero-cta hero-cta--primary"
              href="https://stars777.in/apk/7d4145943d5d4e0d9dc17ceb572ab567.apk"
              target="_blank"
              rel="noopener noreferrer"
            >
              Play Now
            </a>
            <a
              className="hero-live-pill"
              href="https://t.me/stars777_prediction"
              target="_blank"
              rel="noopener noreferrer"
            >
              ● 5.00x Live Multiplier
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
