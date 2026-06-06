'use client'

import { useState } from 'react'
import { useSubjects } from '@/lib/hooks/useSubjects'
import { useStreams } from '@/lib/hooks/useStreams'
import { toast } from 'sonner'
import SubjectFormDialog from '@/components/shared/SubjectFormDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/shared/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { subjectColorPalette } from '@/lib/grade-colors'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import type { Subject } from '@/lib/hooks/useSubjects'

export default function SubjectsPage() {
  const { subjects, loading, createSubject, updateSubject, deleteSubject } =
    useSubjects()
  const { streams } = useStreams()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)

  const filtered = subjects.filter((s) =>
    `${s.name} ${s.code}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (data: {
    name: string
    code: string
    streamIds?: string[]
  }) => {
    await createSubject(data)
    toast.success(`${data.name} has been added`)
  }

  const handleUpdate = async (data: {
    name: string
    code: string
    streamIds?: string[]
  }) => {
    if (!editingSubject) return
    await updateSubject(editingSubject.id, data)
    toast.success(`${data.name} has been updated`)
  }

  const handleDelete = async () => {
    if (!deletingSubject) return
    await deleteSubject(deletingSubject.id)
    toast.error(`${deletingSubject.name} has been removed`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description={`${subjects.length} subject${subjects.length !== 1 ? 's' : ''} in curriculum`}
      >
        <Button
          onClick={() => {
            setEditingSubject(null)
            setFormOpen(true)
          }}
        >
          <Plus size={16} className="mr-2" />
          Add Subject
        </Button>
      </PageHeader>

      <div className="relative max-w-md">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search subjects..."
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading subjects..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title={search ? 'No subjects found' : 'No subjects yet'}
            description="Add your first subject to get started"
            actionLabel="Add Subject"
            onAction={() => setFormOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((subject, index) => {
            const colorClass =
              subjectColorPalette[index % subjectColorPalette.length]

            return (
              <Card key={subject.id} className="p-5">
                <div className="flex gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}
                  >
                    {subject.code.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{subject.code}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/subjects/${subject.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye size={14} className="mr-1.5" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSubject(subject)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingSubject(subject)}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <SubjectFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingSubject(null)
        }}
        onSubmit={editingSubject ? handleUpdate : handleCreate}
        editingSubject={editingSubject}
        streams={streams}
      />

      <ConfirmDialog
        open={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleDelete}
        title={`Delete ${deletingSubject?.name}?`}
        description="This action cannot be undone."
      />
    </div>
  )
}
