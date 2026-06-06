import { prisma } from '@/lib/prisma'
import StatCard from '@/components/shared/StatCard'
import AvatarInitials from '@/components/shared/AvatarInitials'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, School, BookOpen, BarChart3, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const [studentCount, streamCount, subjectCount, resultCount] =
    await Promise.all([
      prisma.student.count(),
      prisma.classStream.count(),
      prisma.subject.count(),
      prisma.result.count(),
    ])

  const recentStudents = await prisma.student.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { classStream: true },
  })

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-violet-600 p-6 sm:p-8 text-white shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary-foreground/80 text-sm font-medium mb-2">
            <Sparkles size={16} />
            <span>Good to see you</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Welcome back!</h2>
          <p className="text-primary-foreground/80 text-sm mt-2 max-w-lg leading-relaxed">
            Here&apos;s what&apos;s happening at Ikonex Academy today. Track students,
            manage assessments, and monitor performance all in one place.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={studentCount}
          subtitle="Across all streams"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Class Streams"
          value={streamCount}
          subtitle="Active classes"
          icon={School}
          color="green"
        />
        <StatCard
          title="Subjects"
          value={subjectCount}
          subtitle="In curriculum"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Results Processed"
          value={resultCount}
          subtitle="Student results"
          icon={BarChart3}
          color="orange"
        />
      </div>

      {/* Recent Students */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Registered Students</CardTitle>
          <Link
            href="/dashboard/students"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </CardHeader>

        {recentStudents.length === 0 ? (
          <CardContent>
            <p className="text-center text-muted-foreground text-sm py-8">
              No students registered yet. Add your first student to get started.
            </p>
          </CardContent>
        ) : (
          <div className="divide-y divide-border">
            {recentStudents.map((student) => (
              <Link
                key={student.id}
                href={`/dashboard/students/${student.id}`}
                className="flex items-center gap-4 px-5 sm:px-6 py-3.5 hover:bg-muted/40 transition-colors"
              >
                <AvatarInitials
                  initials={`${student.firstName[0]}${student.lastName[0]}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {student.studentNumber} · {student.classStream.name}
                  </p>
                </div>
                <span className="text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-full font-medium shrink-0">
                  {student.gender === 'MALE' ? 'Male' : 'Female'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
