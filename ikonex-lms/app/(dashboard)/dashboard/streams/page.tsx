'use client'

import { useState } from 'react'
import { useStreams } from '@/lib/hooks/useStreams'
import { toast } from 'sonner'
import StreamFormDialog from '@/components/shared/StreamFormDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/shared/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, School, Users, BookOpen, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import type { ClassStream } from '@/lib/hooks/useStreams'

export default function StreamsPage() {
  const { streams, loading, createStream, updateStream, deleteStream } =
    useStreams()

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
      <PageHeader
        title="Class Streams"
        description="Manage all class streams in Ikonex Academy"
      >
        <Button
          onClick={() => {
            setEditingStream(null)
            setFormOpen(true)
          }}
        >
          <Plus size={16} className="mr-2" />
          New Stream
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingSpinner label="Loading streams..." />
      ) : streams.length === 0 ? (
        <Card>
          <EmptyState
            icon={School}
            title="No class streams yet"
            description="Create your first class stream to start adding students."
            actionLabel="Create Stream"
            onAction={() => setFormOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {streams.map((stream) => (
            <Card key={stream.id} className="p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center ring-1 ring-primary/10">
                  <School size={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {stream.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Active
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-xl p-3 text-center ring-1 ring-border/50">
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                    <Users size={13} />
                    <span className="text-xs font-medium">Students</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {stream._count?.students ?? 0}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center ring-1 ring-border/50">
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                    <BookOpen size={13} />
                    <span className="text-xs font-medium">Subjects</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {stream._count?.streamSubjects ?? 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                <Link href={`/dashboard/streams/${stream.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye size={14} className="mr-1.5" />
                    View
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingStream(stream)
                    setFormOpen(true)
                  }}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingStream(stream)}
                >
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

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
