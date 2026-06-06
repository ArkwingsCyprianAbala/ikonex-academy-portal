'use client'

import { useState, useEffect } from 'react'
import { useStreams } from '@/lib/hooks/useStreams'
import { useScores } from '@/lib/hooks/useScores'
import { toast } from 'sonner'
import ScoreFormDialog from '@/components/shared/ScoreFormDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  GraduationCap, Pencil, Trash2,
  Plus, Loader2, BookOpen, Users
} from 'lucide-react'
import axios from 'axios'
import type { Score } from '@/lib/hooks/useScores'

interface StreamDetail {
  id: string
  name: string
  students: {
    id: string
    firstName: string
    lastName: string
    studentNumber: string
  }[]
  streamSubjects: {
    id: string
    subject: { id: string; name: string; code: string }
  }[]
}

export default function AssessmentsPage() {
  const { streams } = useStreams()

  const [selectedStreamId, setSelectedStreamId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [streamDetail, setStreamDetail] = useState<StreamDetail | null>(null)
  const [streamLoading, setStreamLoading] = useState(false)

  // Score dialog state
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [targetStudent, setTargetStudent] = useState<{
    id: string; name: string
  } | null>(null)
  const [deletingScore, setDeletingScore] = useState<Score | null>(null)

  const {
    scores,
    loading: scoresLoading,
    createScore,
    updateScore,
    deleteScore
  } = useScores(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  // Fetch stream details when stream selection changes
  useEffect(() => {
    if (!selectedStreamId) {
      setStreamDetail(null)
      setSelectedSubjectId('')
      return
    }
    setStreamLoading(true)
    setSelectedSubjectId('')
    axios.get(`/api/streams/${selectedStreamId}`)
      .then(res => {
        console.log('Stream detail:', res.data.data)
        console.log('Students:', res.data.data?.students)
        console.log('Subjects:', res.data.data?.streamSubjects)
        setStreamDetail(res.data.data)
      })
      .catch(err => console.error('Stream fetch error:', err))
      .finally(() => setStreamLoading(false))
  }, [selectedStreamId])

  // Build a map of studentId -> Score for O(1) lookup
  const scoreMap = scores.reduce<Record<string, Score>>((acc, score) => {
    acc[score.studentId] = score
    return acc
  }, {})

  const selectedSubject = streamDetail?.streamSubjects.find(
    ss => ss.subject.id === selectedSubjectId
  )?.subject

  const handleOpenCreate = (student: {
    id: string
    firstName: string
    lastName: string
  }) => {
    setEditingScore(null)
    setTargetStudent({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`
    })
    setScoreDialogOpen(true)
  }

  const handleOpenEdit = (score: Score) => {
    setEditingScore(score)
    setTargetStudent({
      id: score.studentId,
      name: `${score.student.firstName} ${score.student.lastName}`
    })
    setScoreDialogOpen(true)
  }

  const handleSubmitScore = async (data: {
    examScore: number
    caScore: number
  }) => {
    if (editingScore) {
      await updateScore(editingScore.id, data)
      toast.success('Score has been updated successfully.')
    } else {
      await createScore({
        studentId: targetStudent!.id,
        subjectId: selectedSubjectId,
        ...data
      })
      toast.success(`Score saved for ${targetStudent?.name}.`)
    }
  }

  const handleDeleteScore = async () => {
    if (!deletingScore) return
    await deleteScore(deletingScore.id)
    toast.success('Score has been removed.')
  }

  const gradeBadgeColor: Record<string, string> = {
    A: 'bg-green-100 text-green-700',
    B: 'bg-blue-100 text-blue-700',
    C: 'bg-yellow-100 text-yellow-700',
    D: 'bg-orange-100 text-orange-700',
    F: 'bg-red-100 text-red-700',
  }

  const getGrade = (total: number): string => {
    if (total >= 80) return 'A'
    if (total >= 65) return 'B'
    if (total >= 50) return 'C'
    if (total >= 40) return 'D'
    return 'F'
  }

  const scoredCount = streamDetail?.students.filter(
    s => scoreMap[s.id]
  ).length ?? 0

  const totalStudents = streamDetail?.students.length ?? 0
  const progressPercent = totalStudents > 0
    ? Math.round((scoredCount / totalStudents) * 100)
    : 0

  // Determine what to show in the main content area
  const showSelectStreamPrompt = !selectedStreamId
  const showLoading = selectedStreamId && (streamLoading || scoresLoading)
  const showSelectSubjectPrompt = !showLoading && selectedStreamId && !selectedSubjectId
  const showNoStudents = !showLoading && selectedSubjectId &&
    streamDetail && streamDetail.students.length === 0
  const showTable = !showLoading && selectedSubjectId &&
    streamDetail && streamDetail.students.length > 0

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Assessments</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Record and manage student scores by stream and subject
        </p>
      </div>

      {/* Stream & Subject Selector Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">
          Select Stream &amp; Subject
        </p>

        <div className="flex gap-3 flex-wrap">
          {/* Stream Selector */}
          <div className="flex-1 min-w-[200px]">
            <Select
              value={selectedStreamId}
              onValueChange={val => setSelectedStreamId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class stream..." />
              </SelectTrigger>
              <SelectContent>
                {streams.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selector */}
          <div className="flex-1 min-w-[200px]">
            <Select
              value={selectedSubjectId}
              onValueChange={val => setSelectedSubjectId(val)}
              disabled={
                !streamDetail ||
                streamDetail.streamSubjects.length === 0 ||
                streamLoading
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedStreamId
                    ? 'Select a stream first'
                    : streamLoading
                    ? 'Loading subjects...'
                    : streamDetail?.streamSubjects.length === 0
                    ? 'No subjects assigned to this stream'
                    : 'Select a subject...'
                } />
              </SelectTrigger>
              <SelectContent>
                {streamDetail?.streamSubjects.map(ss => (
                  <SelectItem key={ss.subject.id} value={ss.subject.id}>
                    {ss.subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress Bar — only shown when both are selected */}
        {selectedSubjectId && streamDetail && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users size={15} />
                <span>{totalStudents} student{totalStudents !== 1 ? 's' : ''} in stream</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BookOpen size={15} />
                <span>{scoredCount} score{scoredCount !== 1 ? 's' : ''} recorded</span>
              </div>
              <div className="flex-1 flex items-center gap-3 min-w-[180px]">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 w-12 text-right">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content Area ── */}

      {/* Prompt: select a stream */}
      {showSelectStreamPrompt && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={GraduationCap}
            title="Select a stream to get started"
            description="Choose a class stream above to see its subjects and students."
          />
        </div>
      )}

      {/* Loading spinner */}
      {showLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Prompt: select a subject */}
      {showSelectSubjectPrompt && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={BookOpen}
            title="Now select a subject"
            description="Choose a subject from the dropdown above to view the scoring table."
          />
        </div>
      )}

      {/* No students in stream */}
      {showNoStudents && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={Users}
            title="No students in this stream"
            description="Register students into this stream before recording scores."
          />
        </div>
      )}

      {/* Scoring Table */}
      {showTable && streamDetail && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Table Title Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">
                {streamDetail.name} &mdash; {selectedSubject?.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedSubject?.code}
              </p>
            </div>
            <Badge variant="secondary">
              {scoredCount}/{totalStudents} scored
            </Badge>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Student</span>
            <span className="text-center">Exam (70)</span>
            <span className="text-center">CA (30)</span>
            <span className="text-center">Total</span>
            <span className="text-center">Grade</span>
            <span>Actions</span>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-slate-50">
            {streamDetail.students.map(student => {
              const score = scoreMap[student.id]
              const grade = score ? getGrade(score.total) : null

              return (
                <div
                  key={student.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {student.studentNumber}
                      </p>
                    </div>
                  </div>

                  {/* Exam Score */}
                  <p className="text-center text-sm text-slate-700">
                    {score
                      ? score.examScore
                      : <span className="text-slate-300">—</span>
                    }
                  </p>

                  {/* CA Score */}
                  <p className="text-center text-sm text-slate-700">
                    {score
                      ? score.caScore
                      : <span className="text-slate-300">—</span>
                    }
                  </p>

                  {/* Total */}
                  <p className={`text-center text-sm font-bold ${
                    score
                      ? score.total >= 50
                        ? 'text-green-600'
                        : 'text-red-500'
                      : 'text-slate-300'
                  }`}>
                    {score ? score.total : '—'}
                  </p>

                  {/* Grade Badge */}
                  <div className="flex justify-center">
                    {grade ? (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${gradeBadgeColor[grade]}`}>
                        {grade}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-sm">—</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {score ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(score)}
                        >
                          <Pencil size={14} className="text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDeletingScore(score)}
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleOpenCreate(student)}
                      >
                        <Plus size={13} className="mr-1" />
                        Add Score
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Score Form Dialog */}
      <ScoreFormDialog
        open={scoreDialogOpen}
        onClose={() => {
          setScoreDialogOpen(false)
          setEditingScore(null)
          setTargetStudent(null)
        }}
        onSubmit={handleSubmitScore}
        editingScore={editingScore}
        studentName={targetStudent?.name}
        subjectName={selectedSubject?.name}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingScore}
        onClose={() => setDeletingScore(null)}
        onConfirm={handleDeleteScore}
        title="Delete this score?"
        description="This will permanently remove the score for this student and subject."
      />
    </div>
  )
}