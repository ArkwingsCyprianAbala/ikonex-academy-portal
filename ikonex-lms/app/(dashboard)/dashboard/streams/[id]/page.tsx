'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, BookOpen, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface StreamDetail {
  id: string
  name: string
  students: { id: string; firstName: string; lastName: string; studentNumber: string; gender: string }[]
  streamSubjects: { id: string; subject: { id: string; name: string; code: string } }[]
}

export default function StreamDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [stream, setStream] = useState<StreamDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/streams/${id}`)
      .then(res => setStream(res.data.data))
      .catch(() => router.push('/dashboard/streams'))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-blue-500" />
    </div>
  )

  if (!stream) return null

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={15} className="mr-1.5" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{stream.name}</h2>
          <p className="text-sm text-slate-500">Stream Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students in Stream */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users size={17} className="text-blue-600" />
              <h3 className="font-semibold text-slate-800">Students</h3>
              <Badge variant="secondary">{stream.students.length}</Badge>
            </div>
            <Link href={`/dashboard/students?streamId=${stream.id}`}>
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          {stream.students.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-10">
              No students in this stream yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-50">
              {stream.students.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    {s.firstName[0]}{s.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{s.studentNumber}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{s.gender}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subjects in Stream */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <BookOpen size={17} className="text-purple-600" />
            <h3 className="font-semibold text-slate-800">Assigned Subjects</h3>
            <Badge variant="secondary">{stream.streamSubjects.length}</Badge>
          </div>

          {stream.streamSubjects.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-10">
              No subjects assigned yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-50">
              {stream.streamSubjects.map(ss => (
                <div key={ss.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                    {ss.subject.code.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{ss.subject.name}</p>
                    <p className="text-xs text-slate-400">{ss.subject.code}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}