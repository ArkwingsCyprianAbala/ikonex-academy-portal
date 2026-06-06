'use client'

import { useState } from 'react'
import { useStreams } from '@/lib/hooks/useStreams'
import { toast } from 'sonner'
import StreamFormDialog from '@/components/shared/StreamFormDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus, School, Users, BookOpen,
  Pencil, Trash2, Eye, Loader2
} from 'lucide-react'
import Link from 'next/link'
import type { ClassStream } from '@/lib/hooks/useStreams'

export default function StreamsPage() {
  const { streams, loading, createStream, updateStream, deleteStream } = useStreams()

  const [formOpen, setFormOpen] = useState(false)
  const [editingStream, setEditingStream] = useState<ClassStream | null>(null)
  const [deletingStream, setDeletingStream] = useState<ClassStream | null>(null)

  const handleCreate = async (name: string) => {
    await createStream(name)
    toast.success(`${name} has been created.`)
  }

  const handleUpdate = async (name: string) => {
    if (!editingStream) return
    await updateStream(editingStream.id, name)
    toast.success(`Updated to ${name}.`)
  }

  const handleDelete = async () => {
    if (!deletingStream) return
    await deleteStream(deletingStream.id)
    toast.success(`${deletingStream.name} has been removed.`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Class Streams</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all class streams in Ikonex Academy
          </p>
        </div>
        <Button onClick={() => { setEditingStream(null); setFormOpen(true) }}>
          <Plus size={16} className="mr-2" />
          New Stream
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : streams.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={School}
            title="No class streams yet"
            description="Create your first class stream to start adding students."
            actionLabel="Create Stream"
            onAction={() => setFormOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream) => (
            <div
              key={stream.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              {/* Stream Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <School size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{stream.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
                    <Users size={13} />
                    <span className="text-xs font-medium">Students</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">
                    {stream._count?.students ?? 0}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
                    <BookOpen size={13} />
                    <span className="text-xs font-medium">Subjects</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">
                    {stream._count?.streamSubjects ?? 0}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Link href={`/dashboard/streams/${stream.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye size={14} className="mr-1.5" />
                    View
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditingStream(stream); setFormOpen(true) }}
                >
                  <Pencil size={14} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:border-red-300"
                  onClick={() => setDeletingStream(stream)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <StreamFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={editingStream ? handleUpdate : handleCreate}
        editingStream={editingStream}
      />

      <ConfirmDialog
        open={!!deletingStream}
        onClose={() => setDeletingStream(null)}
        onConfirm={handleDelete}
        title={`Delete ${deletingStream?.name}?`}
        description="All students and data in this stream will be permanently deleted."
      />
    </div>
  )
}