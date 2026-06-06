'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, User, BookOpen, BarChart3 } from 'lucide-react'

interface Score {
  id: string
  examScore: number
  caScore: number
  total: number
  subject: { name: string; code: string }
}

interface Result {
  totalMarks: number
  averageScore: number
  grade: string
  classPosition: number
}

interface StudentDetail {
  id: string
  firstName: string
  lastName: string
  studentNumber: string
  gender: string
  dateOfBirth: string
  classStream: { name: string }
  scores: Score[]
  results: Result[]
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/students/${id}`)
      .then(res => setStudent(res.data.data))
      .catch(() => router.push('/dashboard/students'))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-blue-500" />
    </div>
  )

  if (!student) return null

  const result = student.results?.[0]

  const gradeColor: Record<string, string> = {
    A: 'bg-green-100 text-green-700',
    B: 'bg-blue-100 text-blue-700',
    C: 'bg-yellow-100 text-yellow-700',
    D: 'bg-orange-100 text-orange-700',
    F: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={15} className="mr-1.5" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-sm text-slate-500">{student.studentNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold mb-3">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <h3 className="font-semibold text-slate-800">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-sm text-slate-400">{student.studentNumber}</p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Stream', value: student.classStream.name, icon: User },
              { label: 'Gender', value: student.gender, icon: User },
              {
                label: 'Date of Birth',
                value: new Date(student.dateOfBirth).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'long', year: 'numeric'
                }),
                icon: User
              },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                <span className="text-sm text-slate-700 font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Result Summary */}
          {result && (
            <div className="mt-4 bg-slate-50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Performance Summary
              </p>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Total Marks</span>
                <span className="text-sm font-bold text-slate-800">{result.totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Average</span>
                <span className="text-sm font-bold text-slate-800">{result.averageScore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Grade</span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${gradeColor[result.grade] ?? ''}`}>
                  {result.grade}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Class Position</span>
                <span className="text-sm font-bold text-slate-800">#{result.classPosition}</span>
              </div>
            </div>
          )}
        </div>

        {/* Scores Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <BookOpen size={17} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800">Subject Scores</h3>
            <Badge variant="secondary">{student.scores.length} subjects</Badge>
          </div>

          {student.scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 size={28} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">No scores recorded yet.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span>Subject</span>
                <span className="text-center">Exam (70)</span>
                <span className="text-center">CA (30)</span>
                <span className="text-center">Total (100)</span>
              </div>

              <div className="divide-y divide-slate-50">
                {student.scores.map(score => (
                  <div key={score.id} className="grid grid-cols-4 gap-4 px-6 py-3 items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{score.subject.name}</p>
                      <p className="text-xs text-slate-400">{score.subject.code}</p>
                    </div>
                    <p className="text-center text-sm text-slate-700">{score.examScore}</p>
                    <p className="text-center text-sm text-slate-700">{score.caScore}</p>
                    <p className={`text-center text-sm font-bold ${
                      score.total >= 50 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {score.total}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}