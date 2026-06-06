'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, School, BarChart3 } from 'lucide-react'

interface SubjectDetail {
  id: string
  name: string
  code: string
  streamSubjects: {
    id: string
    classStream: { id: string; name: string }
  }[]
}

export default function SubjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/subjects/${id}`)
      .then(res => setSubject(res.data.data))
      .catch(() => router.push('/dashboard/subjects'))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-blue-500" />
    </div>
  )

  if (!subject) return null

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={15} className="mr-1.5" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{subject.name}</h2>
          <p className="text-sm text-slate-500">{subject.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
              {subject.code.slice(0, 3)}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{subject.name}</h3>
              <p className="text-sm text-slate-400">{subject.code}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <School size={16} />
              <span className="text-sm font-medium">Assigned Streams</span>
            </div>
            <span className="text-xl font-bold text-slate-800">
              {subject.streamSubjects.length}
            </span>
          </div>
        </div>

        {/* Streams List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <School size={17} className="text-purple-600" />
            <h3 className="font-semibold text-slate-800">Assigned Class Streams</h3>
            <Badge variant="secondary">{subject.streamSubjects.length}</Badge>
          </div>

          {subject.streamSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 size={28} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">
                This subject has not been assigned to any stream yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {subject.streamSubjects.map(ss => (
                <div key={ss.id} className="flex items-center gap-3 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <School size={16} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {ss.classStream.name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/streams/${ss.classStream.id}`)}
                  >
                    View Stream
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}