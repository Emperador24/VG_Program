import { useState, useEffect, useRef } from 'react'

const cache = new Map()
const REQUEST_TIMEOUT = 10000 // 10 segundos

export function useApi(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cacheKeyRef = useRef(`${url}-${JSON.stringify(options)}`)

  useEffect(() => {
    const cacheKey = cacheKeyRef.current

    // Usar caché si existe
    if (cache.has(cacheKey) && !options.skipCache) {
      setData(cache.get(cacheKey))
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${token}`,
            ...options.headers
          },
          signal: controller.signal
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        
        const result = await res.json()
        cache.set(cacheKey, result)
        setData(result)
        setError(null)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    fetchData()

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [url, options])

  return { data: data || [], loading, error }
}
