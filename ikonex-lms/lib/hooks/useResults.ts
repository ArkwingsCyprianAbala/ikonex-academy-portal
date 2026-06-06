import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export interface StudentResult {
  id: string
  totalMarks: number
  averageScore: number
  grade: string
  classPosition: number
  student: {
    id: string
    firstName: string
    lastName: string
    studentNumber: string
    classStream: { id: string; name: string }
    scores: {
      id: string
      examScore: number
      caScore: number
      total: number
      subject: { id: string; name: string; code: string }
    }[]
  }
}

export function useResults(streamId?: string) {
  const [results, setResults] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = useCallback(async () => {
    if (!streamId) { setResults([]); return }
    try {
      setLoading(true)
      const res = await axios.get(`/api/results?streamId=${streamId}`)
      setResults(res.data.data)
    } catch {
      setError('Failed to load results')
    } finally {
      setLoading(false)
    }
  }, [streamId])

  const processResults = async (sid: string) => {
    try {
      setProcessing(true)
      const res = await axios.post('/api/results', { streamId: sid })
      await fetchResults()
      return res.data.data
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => { fetchResults() }, [fetchResults])

  return { results, loading, processing, error, processResults, refetch: fetchResults }
}