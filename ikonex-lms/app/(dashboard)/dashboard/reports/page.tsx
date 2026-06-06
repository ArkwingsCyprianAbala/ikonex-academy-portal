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
  FileText, Download, Loader2,
  Users, Trophy, BookOpen
} from 'lucide-react'
import { generateStudentReportCard } from '@/lib/pdf/generateReportCard'
import { generateClassReport } from '@/lib/pdf/generateClassReport'
import type { StudentResult } from '@/lib/hooks/useResults'

export default function ReportsPage() {
  const { streams } = useStreams()

  const [selectedStreamId, setSelectedStreamId] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadingClass, setDownloadingClass] = useState(false)

  const { results, loading } = useResults(selectedStreamId)

  const selectedStream = streams.find(s => s.id === selectedStreamId)

  const handleDownloadStudent = async (result: StudentResult) => {
    try {
      setDownloadingId(result.student.id)
      generateStudentReportCard(result)
      toast.success(
      `${result.student.firstName} ${result.student.lastName}'s report card saved.`
      )
    } catch {
      toast.error('Could not generate the report card.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDownloadClassReport = async () => {
    if (!selectedStream || results.length === 0) return
    try {
      setDownloadingClass(true)
      generateClassReport(selectedStream.name, results)
      toast.success(
      `${selectedStream.name} performance report saved.`
      )
    } catch {
      toast.error('Could not generate the class report.')
    } finally {
      setDownloadingClass(false)
    }
  }

  const gradeColor: Record<string, string> = {
    A: 'bg-green-100 text-green-700',
    B: 'bg-blue-100 text-blue-700',
    C: 'bg-yellow-100 text-yellow-700',
    D: 'bg-orange-100 text-orange-700',
    F: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Reports</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Generate and download PDF report cards and class reports
        </p>
      </div>

      {/* Stream Selector + Class Report Button */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">
          Select Class Stream
        </p>
        <div className="flex items-center gap-3 flex-wrap">
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

          {results.length > 0 && (
            <Button
              variant="outline"
              onClick={handleDownloadClassReport}
              disabled={downloadingClass}
            >
              {downloadingClass ? (
                <Loader2 size={15} className="mr-2 animate-spin" />
              ) : (
                <Download size={15} className="mr-2" />
              )}
              Download Class Report
            </Button>
          )}
        </div>

        {/* Stream Summary */}
        {selectedStreamId && results.length > 0 && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={14} />
              <span>{results.length} students</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BookOpen size={14} />
              <span>
                {results[0]?.student.scores.length ?? 0} subjects
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Trophy size={14} />
              <span>
                Results processed ✓
              </span>
            </div>
          </div>
        )}
      </div>

      {/* No stream selected */}
      {!selectedStreamId && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={FileText}
            title="Select a stream to generate reports"
            description="Choose a class stream above to see all students and download their report cards."
          />
        </div>
      )}

      {/* Loading */}
      {selectedStreamId && loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* No results processed yet */}
      {selectedStreamId && !loading && results.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={Trophy}
            title="No results found for this stream"
            description="Go to the Results page first and click Process Results before generating reports."
          />
        </div>
      )}

      {/* Report Cards List */}
      {selectedStreamId && !loading && results.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">
                {selectedStream?.name} — Individual Report Cards
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click Download to generate a PDF for each student
              </p>
            </div>
            <Badge variant="secondary">{results.length} students</Badge>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span className="w-8 text-center">Pos</span>
            <span>Student</span>
            <span className="text-center">Average</span>
            <span className="text-center">Grade</span>
            <span className="text-center">Subjects</span>
            <span>Download</span>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-slate-50">
            {results.map(result => (
              <div
                key={result.id}
                className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
              >
                {/* Position */}
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                  {result.classPosition}
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

                {/* Average */}
                <p className="text-center text-sm font-medium text-slate-700">
                  {result.averageScore.toFixed(1)}%
                </p>

                {/* Grade */}
                <div className="flex justify-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gradeColor[result.grade]}`}>
                    {result.grade}
                  </span>
                </div>

                {/* Subject Count */}
                <p className="text-center text-sm text-slate-500">
                  {result.student.scores.length}
                </p>

                {/* Download Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadStudent(result)}
                  disabled={downloadingId === result.student.id}
                  className="min-w-[110px]"
                >
                  {downloadingId === result.student.id ? (
                    <Loader2 size={13} className="mr-1.5 animate-spin" />
                  ) : (
                    <Download size={13} className="mr-1.5" />
                  )}
                  Download PDF
                </Button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              PDFs are generated client-side and saved directly to your device
            </p>
          </div>
        </div>
      )}
    </div>
  )
}