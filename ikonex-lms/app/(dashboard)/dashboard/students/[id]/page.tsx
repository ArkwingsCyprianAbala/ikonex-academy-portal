'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import GradeBadge from '@/components/shared/GradeBadge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, BookOpen, BarChart3 } from 'lucide-react'

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

  if (loading) return <LoadingSpinner label="Loading student profile..." />
  if (!student) return null

  const result = student.results?.[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="w-fit">
          <ArrowLeft size={15} className="mr-1.5" /> Back
        </Button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">{student.studentNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-violet-500 text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-lg shadow-primary/20 ring-4 ring-primary/10">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <h3 className="font-semibold text-foreground">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{student.studentNumber}</p>
          </div>

          <div className="space-y-1">
            {[
              { label: 'Stream', value: student.classStream.name },
              { label: 'Gender', value: student.gender === 'MALE' ? 'Male' : 'Female' },
              {
                label: 'Date of Birth',
                value: new Date(student.dateOfBirth).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'long', year: 'numeric',
                }),
              },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                <span className="text-sm text-foreground font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          {result && (
            <div className="mt-5 bg-muted/50 rounded-xl p-4 space-y-2.5 ring-1 ring-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Performance Summary
              </p>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Total Marks</span>
                <span className="text-sm font-bold text-foreground">{result.totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Average</span>
                <span className="text-sm font-bold text-foreground">{result.averageScore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Grade</span>
                <GradeBadge grade={result.grade} />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Class Position</span>
                <span className="text-sm font-bold text-foreground">#{result.classPosition}</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2">
              <BookOpen size={17} className="text-primary" />
              <CardTitle>Subject Scores</CardTitle>
            </div>
            <Badge variant="secondary">{student.scores.length} subjects</Badge>
          </CardHeader>

          {student.scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 size={28} className="text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No scores recorded yet.</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-3 bg-muted/50 border-y border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Subject</span>
                <span className="text-center">Exam (70)</span>
                <span className="text-center">CA (30)</span>
                <span className="text-center">Total (100)</span>
              </div>

              <div className="divide-y divide-border">
                {student.scores.map(score => (
                  <div key={score.id}>
                    <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-3 items-center">
                      <div>
                        <p className="text-sm font-medium text-foreground">{score.subject.name}</p>
                        <p className="text-xs text-muted-foreground">{score.subject.code}</p>
                      </div>
                      <p className="text-center text-sm text-foreground">{score.examScore}</p>
                      <p className="text-center text-sm text-foreground">{score.caScore}</p>
                      <p className={`text-center text-sm font-bold ${
                        score.total >= 50 ? 'text-emerald-600' : 'text-destructive'
                      }`}>
                        {score.total}
                      </p>
                    </div>

                    <div className="sm:hidden px-4 py-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-foreground">{score.subject.name}</p>
                          <p className="text-xs text-muted-foreground">{score.subject.code}</p>
                        </div>
                        <p className={`text-sm font-bold ${
                          score.total >= 50 ? 'text-emerald-600' : 'text-destructive'
                        }`}>
                          {score.total}
                        </p>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Exam: {score.examScore}</span>
                        <span>CA: {score.caScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
