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

    const script = document.createElement('script')
    script.async = true
    script.type = 'text/javascript'
    script.src = 'https://cdn.livechatinc.com/tracking.js'
    script.dataset.starsLivechat = 'true'
    document.head.appendChild(script)

    return undefined
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
