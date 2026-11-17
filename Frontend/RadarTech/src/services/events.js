import { useEffect, useState } from 'react'
import { request } from './api'

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function formatEventDate(value) {
  return value ? dateFormat.format(new Date(value)) : null
}

export function useEvents(path) {
  const [result, setResult] = useState({ data: null, error: '' })

  useEffect(() => {
    const controller = new AbortController()
    request(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ data, error: '' })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ data: null, error: error.message })
      })
    return () => controller.abort()
  }, [path])

  return result
}
