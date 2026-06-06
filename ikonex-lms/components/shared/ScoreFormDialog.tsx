'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Score } from '@/lib/hooks/useScores'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: { examScore: number; caScore: number }) => Promise<void>
  editingScore?: Score | null
  studentName?: string
  subjectName?: string
}

export default function ScoreFormDialog({
  open, onClose, onSubmit,
  editingScore, studentName, subjectName
}: Props) {
  const [examScore, setExamScore] = useState('')
  const [caScore, setCaScore] = useState('')
  const [errors, setErrors] = useState<{ examScore?: string; caScore?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingScore) {
      setExamScore(String(editingScore.examScore))
      setCaScore(String(editingScore.caScore))
    } else {
      setExamScore('')
      setCaScore('')
    }
    setErrors({})
    setServerError('')
  }, [editingScore, open])

  const validate = () => {
    const newErrors: { examScore?: string; caScore?: string } = {}
    const exam = parseFloat(examScore)
    const ca = parseFloat(caScore)

    if (examScore === '') {
      newErrors.examScore = 'Exam score is required'
    } else if (isNaN(exam) || exam < 0 || exam > 70) {
      newErrors.examScore = 'Must be between 0 and 70'
    }

    if (caScore === '') {
      newErrors.caScore = 'CA score is required'
    } else if (isNaN(ca) || ca < 0 || ca > 30) {
      newErrors.caScore = 'Must be between 0 and 30'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      await onSubmit({
        examScore: parseFloat(examScore),
        caScore: parseFloat(caScore)
      })
      onClose()
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setServerError(axiosErr.response?.data?.error ?? 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const total = parseFloat(examScore || '0') + parseFloat(caScore || '0')
  const isValidTotal = !isNaN(total)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingScore ? 'Edit Score' : 'Record Score'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Context Info */}
          {(studentName || subjectName) && (
            <div className="bg-slate-50 rounded-lg px-4 py-3 space-y-1">
              {studentName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Student</span>
                  <span className="font-medium text-slate-800">{studentName}</span>
                </div>
              )}
              {subjectName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subject</span>
                  <span className="font-medium text-slate-800">{subjectName}</span>
                </div>
              )}
            </div>
          )}

          {/* Score Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>
                Exam Score
                <span className="text-slate-400 font-normal ml-1">(out of 70)</span>
              </Label>
              <Input
                type="number"
                min={0}
                max={70}
                placeholder="0 – 70"
                value={examScore}
                onChange={e => {
                  setExamScore(e.target.value)
                  setErrors(p => ({ ...p, examScore: '' }))
                }}
              />
              {errors.examScore && (
                <p className="text-xs text-red-500">{errors.examScore}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>
                CA Score
                <span className="text-slate-400 font-normal ml-1">(out of 30)</span>
              </Label>
              <Input
                type="number"
                min={0}
                max={30}
                placeholder="0 – 30"
                value={caScore}
                onChange={e => {
                  setCaScore(e.target.value)
                  setErrors(p => ({ ...p, caScore: '' }))
                }}
              />
              {errors.caScore && (
                <p className="text-xs text-red-500">{errors.caScore}</p>
              )}
            </div>
          </div>

          {/* Live Total Preview */}
          <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${
            isValidTotal && total >= 50
              ? 'bg-green-50 border border-green-200'
              : isValidTotal && total > 0
              ? 'bg-red-50 border border-red-200'
              : 'bg-slate-50 border border-slate-200'
          }`}>
            <span className="text-sm font-medium text-slate-600">
              Total Score (out of 100)
            </span>
            <span className={`text-2xl font-bold ${
              isValidTotal && total >= 50 ? 'text-green-700' :
              isValidTotal && total > 0 ? 'text-red-600' :
              'text-slate-400'
            }`}>
              {isValidTotal ? total.toFixed(1) : '—'}
            </span>
          </div>

          {/* Grading Guide */}
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { range: '80–100', grade: 'A', color: 'bg-green-100 text-green-700' },
              { range: '65–79', grade: 'B', color: 'bg-blue-100 text-blue-700' },
              { range: '50–64', grade: 'C', color: 'bg-yellow-100 text-yellow-700' },
              { range: '40–49', grade: 'D', color: 'bg-orange-100 text-orange-700' },
              { range: '0–39', grade: 'F', color: 'bg-red-100 text-red-700' },
            ].map(g => (
              <div key={g.grade} className={`rounded-lg p-2 text-center ${g.color}`}>
                <p className="text-base font-bold">{g.grade}</p>
                <p className="text-xs">{g.range}</p>
              </div>
            ))}
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : editingScore ? 'Update Score' : 'Record Score'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}