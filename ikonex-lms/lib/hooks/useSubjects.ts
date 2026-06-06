import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export interface Subject {
  id: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
  _count?: { streamSubjects: number }
  streamSubjects?: {
    classStream: {
      id: string
      name: string
      createdAt: string
      updatedAt: string
    }
  }[]
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/subjects')
      setSubjects(res.data.data)
    } catch {
      setError('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }, [])

  const createSubject = async (data: { name: string; code: string }) => {
    const res = await axios.post('/api/subjects', data)
    await fetchSubjects()
    return res.data.data
  }

  const updateSubject = async (
    id: string,
    data: { name?: string; code?: string; streamIds?: string[] }
  ) => {
    const res = await axios.put(`/api/subjects/${id}`, data)
    await fetchSubjects()
    return res.data.data
  }

  const deleteSubject = async (id: string) => {
    await axios.delete(`/api/subjects/${id}`)
    await fetchSubjects()
  }

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  return {
    subjects, loading, error,
    createSubject, updateSubject, deleteSubject,
    refetch: fetchSubjects
  }
}