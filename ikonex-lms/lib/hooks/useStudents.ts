import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export interface Student {
  id: string
  firstName: string
  lastName: string
  studentNumber: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth: string
  classStreamId: string
  classStream: { id: string; name: string }
  createdAt: string
}

export function useStudents(streamId?: string) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const url = streamId
        ? `/api/students?streamId=${streamId}`
        : '/api/students'
      const res = await axios.get(url)
      setStudents(res.data.data)
    } catch {
      setError('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [streamId])

  const createStudent = async (data: Omit<Student, 'id' | 'classStream' | 'createdAt'>) => {
    const res = await axios.post('/api/students', data)
    await fetchStudents()
    return res.data.data
  }

  const updateStudent = async (id: string, data: Partial<Student>) => {
    const res = await axios.put(`/api/students/${id}`, data)
    await fetchStudents()
    return res.data.data
  }

  const deleteStudent = async (id: string) => {
    await axios.delete(`/api/students/${id}`)
    await fetchStudents()
  }

  useEffect(() => { fetchStudents() }, [fetchStudents])

  return { students, loading, error, createStudent, updateStudent, deleteStudent, refetch: fetchStudents }
}