import { useCallback, useEffect, useMemo, useState } from 'react'

function useWebsiteData(token) {
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState('')
  const [unauthorized, setUnauthorized] = useState(false)
  const [data, setData] = useState({
    dashboard: null,
    games: [],
    blogPosts: [],
    reviews: [],
    faqs: [],
    siteSettings: null,
    seo: null,
    contactSubmissions: [],
  })

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || '/api/admin',
    [],
  )

  const fetchAdmin = useCallback(async (path) => {
    const response = await fetch(`${apiBase}/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('unauthorized')
    }

    return response.json()
  }, [apiBase, token])

  const refreshData = useCallback(async () => {
    if (!token) {
      return
    }

    const [dashboard, games, blogPosts, reviews, faqs, siteSettings, seo, contactSubmissions] =
      await Promise.all([
        fetchAdmin('dashboard'),
        fetchAdmin('games'),
        fetchAdmin('blog-posts'),
        fetchAdmin('reviews'),
        fetchAdmin('faqs'),
        fetchAdmin('site-settings'),
        fetchAdmin('seo'),
        fetchAdmin('contact-submissions'),
      ])

    setData({
      dashboard,
      games,
      blogPosts,
      reviews,
      faqs,
      siteSettings,
      seo,
      contactSubmissions,
    })
  }, [fetchAdmin, token])

  useEffect(() => {
    if (!token) {
      setUnauthorized(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError('')
      setUnauthorized(false)

      try {
        await refreshData()
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.message === 'unauthorized') {
          setUnauthorized(true)
          setError('Your admin session expired. Please sign in again.')
        } else {
          setError('Unable to load admin data. Check login and backend status.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshData, token])

  const sendAdminRequest = async (path, options = {}) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${apiBase}/${path}`, {
      ...options,
      headers,
    })

    const responseContentType = response.headers.get('content-type') || ''
    const isJsonResponse = responseContentType.includes('application/json')
    const responsePayload = isJsonResponse ? await response.json() : null

    if (response.status === 401) {
      throw new Error('unauthorized')
    }

    if (!response.ok) {
      throw new Error(responsePayload?.message || 'games_request_failed')
    }

    if (response.status === 204) {
      return null
    }

    return responsePayload
  }

  const uploadBlogImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await sendAdminRequest('uploads/blog-images', {
      method: 'POST',
      body: formData,
    })

    return String(response?.url || '')
  }

  const createGame = async (payload) => {
    await sendAdminRequest('games', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const updateGame = async (id, payload) => {
    await sendAdminRequest(`games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const deleteGame = async (id) => {
    await sendAdminRequest(`games/${id}`, {
      method: 'DELETE',
    })
    await refreshData()
  }

  const bulkUpdateGames = async (payload) => {
    await sendAdminRequest('games/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }





  const createBlogPost = async (payload) => {
    await sendAdminRequest('blog-posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const updateBlogPost = async (id, payload) => {
    await sendAdminRequest(`blog-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const deleteBlogPost = async (id) => {
    await sendAdminRequest(`blog-posts/${id}`, {
      method: 'DELETE',
    })
    await refreshData()
  }

  const bulkUpdateBlogPosts = async (payload) => {
    await sendAdminRequest('blog-posts/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const createReview = async (payload) => {
    await sendAdminRequest('reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const updateReview = async (id, payload) => {
    await sendAdminRequest(`reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const deleteReview = async (id) => {
    await sendAdminRequest(`reviews/${id}`, {
      method: 'DELETE',
    })
    await refreshData()
  }

  const bulkUpdateReviews = async (payload) => {
    await sendAdminRequest('reviews/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const createFaq = async (payload) => {
    await sendAdminRequest('faqs', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const updateFaq = async (id, payload) => {
    await sendAdminRequest(`faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const deleteFaq = async (id) => {
    await sendAdminRequest(`faqs/${id}`, {
      method: 'DELETE',
    })
    await refreshData()
  }

  const bulkUpdateFaqs = async (payload) => {
    await sendAdminRequest('faqs/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const updateSiteSettings = async (payload) => {
    await sendAdminRequest('site-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  const updateSeoSettings = async (payload) => {
    await sendAdminRequest('seo', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    await refreshData()
  }

  return {
    loading,
    error,
    unauthorized,
    data,
    refreshData,
    createGame,
    updateGame,
    deleteGame,
    bulkUpdateGames,
    uploadBlogImage,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    bulkUpdateBlogPosts,
    createReview,
    updateReview,
    deleteReview,
    bulkUpdateReviews,
    createFaq,
    updateFaq,
    deleteFaq,
    bulkUpdateFaqs,
    updateSiteSettings,
    updateSeoSettings,
  }
}

export default useWebsiteData
