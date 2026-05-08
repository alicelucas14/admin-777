import { useEffect, useMemo, useState } from 'react'

function LiveChatWidget() {
  const [siteSettings, setSiteSettings] = useState(null)
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

        setSiteSettings(await response.json())
      } catch {
        setSiteSettings(null)
      }
    }

    fetchSiteSettings()
  }, [publicApiBase])

  useEffect(() => {
    const license = getLiveChatLicense(siteSettings?.contactPage?.liveChatLink)
    if (!license || typeof window === 'undefined') {
      return undefined
    }

    window.__lc = window.__lc || {}
    window.__lc.license = license
    window.__lc.integration_name = 'manual_channels'
    window.__lc.product_name = 'livechat'

    if (document.querySelector('script[data-stars-livechat="true"]')) {
      return undefined
    }

    let idleHandle = null
    let timeoutHandle = null

    const loadScript = () => {
      if (document.querySelector('script[data-stars-livechat="true"]')) {
        return
      }

      const script = document.createElement('script')
      script.async = true
      script.type = 'text/javascript'
      script.src = 'https://cdn.livechatinc.com/tracking.js'
      script.dataset.starsLivechat = 'true'
      document.head.appendChild(script)
    }

    const loadOnInteraction = () => {
      detachListeners()
      if (idleHandle && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle)
      }
      if (timeoutHandle) {
        window.clearTimeout(timeoutHandle)
      }
      loadScript()
    }

    const interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll']
    const detachListeners = () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, loadOnInteraction)
      })
    }

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, loadOnInteraction, { once: true, passive: true })
    })

    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(loadScript, { timeout: 4000 })
    } else {
      timeoutHandle = window.setTimeout(loadScript, 4000)
    }

    return () => {
      detachListeners()
      if (idleHandle && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle)
      }
      if (timeoutHandle) {
        window.clearTimeout(timeoutHandle)
      }
    }
  }, [siteSettings])

  return null
}

function getLiveChatLicense(value) {
  const content = String(value || '')
  const licenseMatch = content.match(/window\.__lc\.license\s*=\s*(\d+)/)
  if (licenseMatch) {
    return Number(licenseMatch[1])
  }

  const chatLinkMatch = content.match(/chat-with\/(\d+)/)
  if (chatLinkMatch) {
    return Number(chatLinkMatch[1])
  }

  return null
}

export default LiveChatWidget
