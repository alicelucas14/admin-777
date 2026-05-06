import { useEffect, useMemo, useState } from 'react'

function JackpotSection() {
  const [jackpotSection, setJackpotSection] = useState(defaultJackpotSection)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch(`${publicApiBase}/site-settings`)
        if (!response.ok) {
          return
        }

        const result = await response.json()
        setJackpotSection(normalizeJackpotSection(result?.jackpotSection))
      } catch {
        setJackpotSection(defaultJackpotSection)
      }
    }

    fetchSiteSettings()
  }, [publicApiBase])

  useEffect(() => {
    setShouldAnimate(false)
    const timerId = window.setTimeout(() => setShouldAnimate(true), 140)
    return () => window.clearTimeout(timerId)
  }, [jackpotSection.totalAmount])

  const totalAmount = useCountUp(jackpotSection.totalAmount, shouldAnimate)

  if (!jackpotSection.items.length) {
    return null
  }

  return (
    <section id="jackpot" className="section-block jackpot-section">
      <div className="jackpot-panel">
        <div className="jackpot-heading">
          <img
            src="/JACKPOT.webp"
            alt={jackpotSection.title}
            className="jackpot-heading__image"
            loading="eager"
            decoding="async"
          />
        </div>

        <p className="jackpot-pool-label">{jackpotSection.prizePoolLabel}</p>
        <p className="jackpot-total" aria-label={`Total jackpot ${formatInr(totalAmount)}`}>
          {formatInr(totalAmount)}
        </p>

        <div className="jackpot-grid">
          {jackpotSection.items.map((item) => (
            <JackpotCard key={item.id} item={item} animate={shouldAnimate} />
          ))}
        </div>
      </div>
    </section>
  )
}

function JackpotCard({ item, animate }) {
  const animatedAmount = useCountUp(item.amount, animate)

  return (
    <article className="jackpot-card">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="jackpot-card__image"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="jackpot-card__image jackpot-card__image--placeholder" aria-hidden="true">
          <span>{item.title}</span>
        </div>
      )}

      <div className="jackpot-card__overlay" />

      <div className="jackpot-card__content">
        <h3>{item.title}</h3>
        <p>{formatInr(animatedAmount)}</p>
      </div>
    </article>
  )
}

function useCountUp(target, shouldStart) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!shouldStart) {
      return undefined
    }

    const safeTarget = Number.isFinite(Number(target)) ? Number(target) : 0
    const duration = Math.min(4600, Math.max(2400, safeTarget / 1800))
    const startTime = performance.now()
    let frameId = 0

    const tick = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(safeTarget * eased)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      }
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [shouldStart, target])

  return value
}

function normalizeJackpotSection(value) {
  const section = value || {}
  const items = Array.isArray(section.items)
    ? section.items
        .map((item, index) => ({
          id: item?.id || `jackpot-item-${index + 1}`,
          title: String(item?.title || '').trim(),
          amount: normalizeAmount(item?.amount),
          imageUrl: String(item?.imageUrl || '').trim(),
        }))
        .filter((item) => item.title)
    : []

  return {
    title: String(section.title || '').trim() || defaultJackpotSection.title,
    prizePoolLabel:
      String(section.prizePoolLabel || '').trim() || defaultJackpotSection.prizePoolLabel,
    totalAmount: computeJackpotTotal(items.length > 0 ? items : defaultJackpotSection.items),
    items: items.length > 0 ? items : defaultJackpotSection.items,
  }
}

function computeJackpotTotal(items) {
  return items.reduce((sum, item) => sum + normalizeAmount(item.amount), 0)
}

function normalizeAmount(value, fallback = 0) {
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed
  }

  return fallback
}

function formatInr(value) {
  return `₹${inrFormatter.format(Number(value) || 0)}`
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const defaultJackpotSection = {
  title: 'JACKPOT',
  prizePoolLabel: 'Prize pool:',
  totalAmount: 6122526.03,
  items: [
    { id: 'aztecs-millions', title: "Aztec's Millions", amount: 1797081.18, imageUrl: '' },
    { id: 'megasaur', title: 'Megasaur', amount: 1027029.02, imageUrl: '' },
    { id: 'jackpot-pinatas-deluxe', title: 'Jackpot Pinatas Deluxe', amount: 267536.73, imageUrl: '' },
    { id: 'spirit-of-the-inca', title: 'Spirit of the Inca', amount: 264155.17, imageUrl: '' },
    { id: 'shopping-spree-ii', title: 'Shopping Spree II', amount: 199525.7, imageUrl: '' },
  ],
}

export default JackpotSection