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

      <PageHeader
        title="Results"
        description="Process and view student rankings per class stream"
      >
        {selectedStreamId && (
          <Button onClick={handleProcess} disabled={processing}>
            {processing ? (
              <><Loader2 size={15} className="mr-2 animate-spin" /> Processing...</>
            ) : (
              <><RefreshCw size={15} className="mr-2" /> Process Results</>
            )}
          </Button>
        )}
      </PageHeader>

      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground mb-3">
          Select Class Stream
        </p>
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
      </Card>

      {!selectedStreamId && (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Select a stream to view results"
            description="Choose a class stream above then click Process Results to calculate rankings."
          />
        </Card>
      )}

      {selectedStreamId && loading && (
        <LoadingSpinner label="Loading results..." />
      )}

      {selectedStreamId && !loading && results.length === 0 && (
        <Card>
          <EmptyState
            icon={Trophy}
            title="No results processed yet"
            description="Make sure students have scores recorded, then click Process Results above."
            actionLabel="Process Results Now"
            onAction={handleProcess}
          />
        </Card>
      )}

      {selectedStreamId && !loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Total Students', value: results.length },
              { icon: TrendingUp, label: 'Class Average', value: `${avgScore.toFixed(1)}%` },
              { icon: Star, label: 'Highest Score', value: `${highestScore.toFixed(1)}%` },
              { icon: Trophy, label: 'Students Passing', value: `${passCount} / ${results.length}` },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <stat.icon size={15} />
                  <span className="text-xs font-medium">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden hidden lg:block">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">
                  {selectedStream?.name} — Class Rankings
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
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
            <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span className="w-8 text-center">#</span>
              <span>Student</span>
              <span className="text-center">Total</span>
              <span className="text-center">Average</span>
              <span className="text-center">Grade</span>
              <span className="text-center">Subjects</span>
              <span className="w-6" />
            </div>

            {/* Result Rows */}
            <div className="divide-y divide-border">
              {results.map(result => {
                const isExpanded = expandedStudent === result.student.id

                return (
                  <div key={result.id}>
                    <div
                      className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedStudent(
                        isExpanded ? null : result.student.id
                      )}
                    >
                      {/* Position Badge */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getPositionStyle(result.classPosition)}`}>
                        {result.classPosition === 1 ? '🥇' :
                         result.classPosition === 2 ? '🥈' :
                         result.classPosition === 3 ? '🥉' :
                         result.classPosition}
                      </div>

                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <AvatarInitials
                          initials={`${result.student.firstName[0]}${result.student.lastName[0]}`}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {result.student.firstName} {result.student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.student.studentNumber}
                          </p>
                        </div>
                      </div>

                      <p className="text-center text-sm font-bold text-foreground">
                        {result.totalMarks.toFixed(1)}
                      </p>

                      <p className="text-center text-sm text-foreground">
                        {result.averageScore.toFixed(1)}%
                      </p>

                      <div className="flex justify-center">
                        <GradeBadge grade={result.grade} />
                      </div>

                      <p className="text-center text-sm text-muted-foreground">
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
                      <div className="px-6 pb-4 bg-muted/30 border-t border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3">
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
                                className="bg-card rounded-lg border border-border px-4 py-3 flex items-center justify-between"
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {score.subject.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Exam: {score.examScore} · CA: {score.caScore}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-foreground">
                                    {score.total}
                                  </p>
                                  <GradeBadge grade={subjectGrade} className="mt-1" />
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Row Summary */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">
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
            <CardFooter className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {results.length} student{results.length !== 1 ? 's' : ''} ranked
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {['A', 'B', 'C', 'D', 'F'].map(g => (
                  <div key={g} className="flex items-center gap-1">
                    <GradeBadge grade={g} />
                    <span className="text-xs text-muted-foreground">
                      {results.filter(r => r.grade === g).length}
                    </span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>

          {/* Mobile rankings */}
          <div className="lg:hidden space-y-3">
            {results.map(result => (
              <Card key={result.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getPositionStyle(result.classPosition)}`}>
                    {result.classPosition <= 3 ? ['🥇','🥈','🥉'][result.classPosition - 1] : result.classPosition}
                  </div>
                  <AvatarInitials initials={`${result.student.firstName[0]}${result.student.lastName[0]}`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {result.student.firstName} {result.student.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{result.averageScore.toFixed(1)}% avg</p>
                  </div>
                  <GradeBadge grade={result.grade} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}