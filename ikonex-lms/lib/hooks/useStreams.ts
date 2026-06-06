import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export interface ClassStream {
  id: string
  name: string
  createdAt: string
  _count?: {
    students: number
    streamSubjects: number
  }
}

export function useStreams() {
  const [streams, setStreams] = useState<ClassStream[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStreams = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/streams')
      setStreams(res.data.data)
    } catch {
      setError('Failed to load streams')
    } finally {
      setLoading(false)
    }
  }, [])

  const createStream = async (name: string) => {
    const res = await axios.post('/api/streams', { name })
    await fetchStreams()
    return res.data.data
  }

  const updateStream = async (id: string, name: string) => {
    const res = await axios.put(`/api/streams/${id}`, { name })
    await fetchStreams()
    return res.data.data
  }

  const deleteStream = async (id: string) => {
    await axios.delete(`/api/streams/${id}`)
    await fetchStreams()
  }

  useEffect(() => { fetchStreams() }, [fetchStreams])

  return { streams, loading, error, createStream, updateStream, deleteStream, refetch: fetchStreams }
}