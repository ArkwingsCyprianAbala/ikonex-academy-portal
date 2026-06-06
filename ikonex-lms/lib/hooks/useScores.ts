import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export interface Score {
  id: string
  examScore: number
  caScore: number
  total: number
  studentId: string
  subjectId: string
  student: {
    id: string
    firstName: string
    lastName: string
    studentNumber: string
    classStream: { id: string; name: string }
  }
  subject: { id: string; name: string; code: string }
}

export function useScores(filters?: { studentId?: string; subjectId?: string }) {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScores = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.studentId) params.set('studentId', filters.studentId)
      if (filters?.subjectId) params.set('subjectId', filters.subjectId)
      const res = await axios.get(`/api/scores?${params.toString()}`)
      setScores(res.data.data)
    } catch {
      setError('Failed to load scores')
    } finally {
      setLoading(false)
    }
  }, [filters?.studentId, filters?.subjectId])

  const createScore = async (data: {
    studentId: string
    subjectId: string
    examScore: number
    caScore: number
  }) => {
    const res = await axios.post('/api/scores', data)
    await fetchScores()
    return res.data.data
  }

  const updateScore = async (id: string, data: {
    examScore: number
    caScore: number
  }) => {
    const res = await axios.put(`/api/scores/${id}`, data)
    await fetchScores()
    return res.data.data
  }

  const deleteScore = async (id: string) => {
    await axios.delete(`/api/scores/${id}`)
    await fetchScores()
  }

  useEffect(() => { fetchScores() }, [fetchScores])

  return {
    scores, loading, error,
    createScore, updateScore, deleteScore,
    refetch: fetchScores
  }
}