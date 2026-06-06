'use client'

import { useState } from 'react'
import { useStreams } from '@/lib/hooks/useStreams'
import { useResults } from '@/lib/hooks/useResults'
import { toast } from 'sonner'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  BarChart3, Loader2, Trophy,
  RefreshCw, ChevronDown, ChevronUp,
  Users, Star, TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function ResultsPage() {
  const { streams } = useStreams()

  const [selectedStreamId, setSelectedStreamId] = useState('')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  const {
    results, loading, processing,
    processResults
  } = useResults(selectedStreamId)

  const handleProcess = async () => {
  if (!selectedStreamId) return

  try {
    await processResults(selectedStreamId)

    toast.success(
      'Rankings and grades have been calculated.'
    )
  } catch {
    toast.error(
      'Processing failed. Make sure all students have scores recorded.'
    )
  }
}

  const gradeColor: Record<string, string> = {
    A: 'bg-green-100 text-green-700 border-green-200',
    B: 'bg-blue-100 text-blue-700 border-blue-200',
    C: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    D: 'bg-orange-100 text-orange-700 border-orange-200',
    F: 'bg-red-100 text-red-700 border-red-200',
  }

  const positionStyle = (pos: number) => {
    if (pos === 1) return 'bg-yellow-400 text-white'
    if (pos === 2) return 'bg-slate-400 text-white'
    if (pos === 3) return 'bg-amber-600 text-white'
    return 'bg-slate-100 text-slate-600'
  }

  const selectedStream = streams.find(s => s.id === selectedStreamId)

  // Summary stats from results
  const avgScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.averageScore, 0) / results.length
    : 0

  const highestScore = results.length > 0
    ? Math.max(...results.map(r => r.averageScore))
    : 0

  const passCount = results.filter(r => r.averageScore >= 50).length

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Results</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Process and view student rankings per class stream
          </p>
        </div>

        {selectedStreamId && (
          <Button
            onClick={handleProcess}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processing ? (
              <><Loader2 size={15} className="mr-2 animate-spin" /> Processing...</>
            ) : (
              <><RefreshCw size={15} className="mr-2" /> Process Results</>
            )}
          </Button>
        )}
      </div>

      {/* Stream Selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">
          Select Class Stream
        </p>
        <Select value={selectedStreamId} onValueChange={setSelectedStreamId}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a stream..." />
          </SelectTrigger>
          <SelectContent>
            {streams.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No stream selected */}
      {!selectedStreamId && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={BarChart3}
            title="Select a stream to view results"
            description="Choose a class stream above then click Process Results to calculate rankings."
          />
        </div>
      )}

      {/* Loading */}
      {selectedStreamId && loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* No results yet */}
      {selectedStreamId && !loading && results.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={Trophy}
            title="No results processed yet"
            description="Make sure students have scores recorded, then click Process Results above."
            actionLabel="Process Results Now"
            onAction={handleProcess}
          />
        </div>
      )}

      {/* Results Content */}
      {selectedStreamId && !loading && results.length > 0 && (
        <div className="space-y-4">

          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Users size={15} />
                <span className="text-xs font-medium">Total Students</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{results.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <TrendingUp size={15} />
                <span className="text-xs font-medium">Class Average</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {avgScore.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Star size={15} />
                <span className="text-xs font-medium">Highest Score</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {highestScore.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Trophy size={15} />
                <span className="text-xs font-medium">Students Passing</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {passCount}
                <span className="text-sm font-normal text-slate-400 ml-1">
                  / {results.length}
                </span>
              </p>
            </div>
          </div>

          {/* Rankings Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">
                  {selectedStream?.name} — Class Rankings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click a row to expand subject breakdown
                </p>
              </div>
              <Link href="/dashboard/reports">
                <Button variant="outline" size="sm">
                  Generate Reports →
                </Button>
              </Link>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span className="w-8 text-center">#</span>
              <span>Student</span>
              <span className="text-center">Total</span>
              <span className="text-center">Average</span>
              <span className="text-center">Grade</span>
              <span className="text-center">Subjects</span>
              <span className="w-6" />
            </div>

            {/* Result Rows */}
            <div className="divide-y divide-slate-50">
              {results.map(result => {
                const isExpanded = expandedStudent === result.student.id

                return (
                  <div key={result.id}>
                    {/* Main Row */}
                    <div
                      className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedStudent(
                        isExpanded ? null : result.student.id
                      )}
                    >
                      {/* Position Badge */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${positionStyle(result.classPosition)}`}>
                        {result.classPosition === 1 ? '🥇' :
                         result.classPosition === 2 ? '🥈' :
                         result.classPosition === 3 ? '🥉' :
                         result.classPosition}
                      </div>

                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {result.student.firstName[0]}{result.student.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {result.student.firstName} {result.student.lastName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {result.student.studentNumber}
                          </p>
                        </div>
                      </div>

                      {/* Total Marks */}
                      <p className="text-center text-sm font-bold text-slate-800">
                        {result.totalMarks.toFixed(1)}
                      </p>

                      {/* Average */}
                      <p className="text-center text-sm text-slate-700">
                        {result.averageScore.toFixed(1)}%
                      </p>

                      {/* Grade */}
                      <div className="flex justify-center">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${gradeColor[result.grade] ?? ''}`}>
                          {result.grade}
                        </span>
                      </div>

                      {/* Subject Count */}
                      <p className="text-center text-sm text-slate-500">
                        {result.student.scores.length}
                      </p>

                      {/* Expand Toggle */}
                      <div className="w-6 flex justify-end">
                        {isExpanded
                          ? <ChevronUp size={15} className="text-slate-400" />
                          : <ChevronDown size={15} className="text-slate-400" />
                        }
                      </div>
                    </div>

                    {/* Expanded Subject Breakdown */}
                    {isExpanded && (
                      <div className="px-6 pb-4 bg-slate-50 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3">
                          Subject Breakdown
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {result.student.scores.map(score => {
                            const subjectGrade =
                              score.total >= 80 ? 'A' :
                              score.total >= 65 ? 'B' :
                              score.total >= 50 ? 'C' :
                              score.total >= 40 ? 'D' : 'F'

                            return (
                              <div
                                key={score.id}
                                className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between"
                              >
                                <div>
                                  <p className="text-sm font-medium text-slate-800">
                                    {score.subject.name}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Exam: {score.examScore} · CA: {score.caScore}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-slate-800">
                                    {score.total}
                                  </p>
                                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${gradeColor[subjectGrade]}`}>
                                    {subjectGrade}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Row Summary */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                          <span className="text-xs text-slate-500">
                            {result.student.scores.length} subjects recorded
                          </span>
                          <Link href={`/dashboard/students/${result.student.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              View Full Profile →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Table Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {results.length} student{results.length !== 1 ? 's' : ''} ranked
              </p>
              <div className="flex items-center gap-3">
                {['A', 'B', 'C', 'D', 'F'].map(g => (
                  <div key={g} className="flex items-center gap-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${gradeColor[g]}`}>
                      {g}
                    </span>
                    <span className="text-xs text-slate-400">
                      {results.filter(r => r.grade === g).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}