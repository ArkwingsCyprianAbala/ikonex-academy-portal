'use client'

import { useState } from 'react'
import { useStreams } from '@/lib/hooks/useStreams'
import { useResults } from '@/lib/hooks/useResults'
import { toast } from 'sonner'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/shared/PageHeader'
import AvatarInitials from '@/components/shared/AvatarInitials'
import GradeBadge from '@/components/shared/GradeBadge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { getPositionStyle } from '@/lib/grade-colors'
import { Card, CardFooter } from '@/components/ui/card'
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download PDF report cards and class reports"
      />

      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground mb-3">
          Select Class Stream
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedStreamId} onValueChange={setSelectedStreamId}>
            <SelectTrigger className="max-w-xs h-10">
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
          <div className="flex gap-4 mt-4 pt-4 border-t border-border flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={14} />
              <span>{results.length} students</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen size={14} />
              <span>
                {results[0]?.student.scores.length ?? 0} subjects
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy size={14} />
              <span>
                Results processed ✓
              </span>
            </div>
          </div>
        )}
      </Card>

      {!selectedStreamId && (
        <Card>
          <EmptyState
            icon={FileText}
            title="Select a stream to generate reports"
            description="Choose a class stream above to see all students and download their report cards."
          />
        </Card>
      )}

      {selectedStreamId && loading && (
        <LoadingSpinner label="Loading reports..." />
      )}

      {selectedStreamId && !loading && results.length === 0 && (
        <Card>
          <EmptyState
            icon={Trophy}
            title="No results found for this stream"
            description="Go to the Results page first and click Process Results before generating reports."
          />
        </Card>
      )}

      {selectedStreamId && !loading && results.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-foreground">
                {selectedStream?.name} — Individual Report Cards
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click Download to generate a PDF for each student
              </p>
            </div>
            <Badge variant="secondary">{results.length} students</Badge>
          </div>

          {/* Column Headers */}
          <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span className="w-8 text-center">Pos</span>
            <span>Student</span>
            <span className="text-center">Average</span>
            <span className="text-center">Grade</span>
            <span className="text-center">Subjects</span>
            <span>Download</span>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-border">
            {results.map(result => (
              <div key={result.id}>
                <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getPositionStyle(result.classPosition)}`}>
                    {result.classPosition}
                  </div>
                  <div className="flex items-center gap-3">
                    <AvatarInitials initials={`${result.student.firstName[0]}${result.student.lastName[0]}`} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {result.student.firstName} {result.student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.student.studentNumber}
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium text-foreground">
                    {result.averageScore.toFixed(1)}%
                  </p>
                  <div className="flex justify-center">
                    <GradeBadge grade={result.grade} />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    {result.student.scores.length}
                  </p>
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

                <div className="md:hidden p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getPositionStyle(result.classPosition)}`}>
                      {result.classPosition}
                    </div>
                    <AvatarInitials initials={`${result.student.firstName[0]}${result.student.lastName[0]}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {result.student.firstName} {result.student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{result.averageScore.toFixed(1)}% · {result.student.scores.length} subjects</p>
                    </div>
                    <GradeBadge grade={result.grade} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDownloadStudent(result)}
                    disabled={downloadingId === result.student.id}
                  >
                    {downloadingId === result.student.id ? (
                      <Loader2 size={13} className="mr-1.5 animate-spin" />
                    ) : (
                      <Download size={13} className="mr-1.5" />
                    )}
                    Download PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <CardFooter>
            <p className="text-xs text-muted-foreground">
              PDFs are generated client-side and saved directly to your device
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}