import { prisma } from '@/lib/prisma'
import StatCard from '@/components/shared/StatCard'
import { Users, School, BookOpen, BarChart3 } from 'lucide-react'
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
    include: { classStream: true }
  })

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold">Welcome back! 👋</h2>
        <p className="text-blue-100 text-sm mt-1">
          Have a look at what is happening at Ikonex Academy today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Recently Registered Students</h3>
          <Link
            href="/dashboard/students"
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentStudents.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            No students registered yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-4 px-6 py-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                  {student.firstName[0]}{student.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {student.studentNumber} · {student.classStream.name}
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {student.gender}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}