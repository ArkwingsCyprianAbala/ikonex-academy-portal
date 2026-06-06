'use client'

import { useState } from 'react'
import { useSubjects } from '@/lib/hooks/useSubjects'
import { useStreams } from '@/lib/hooks/useStreams'
import { toast } from 'sonner'
import SubjectFormDialog from '@/components/shared/SubjectFormDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen, Plus, Search,
  Pencil, Trash2, Eye, Loader2
} from 'lucide-react'
import Link from 'next/link'
import type { Subject } from '@/lib/hooks/useSubjects'

export default function SubjectsPage() {
  const { subjects, loading, createSubject, updateSubject, deleteSubject } = useSubjects()
  const { streams } = useStreams()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)

  const filtered = subjects.filter(s =>
    `${s.name} ${s.code}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (data: { name: string; code: string; streamIds?: string[] }) => {
    await createSubject(data)

    toast.success(`${data.name} has been added`)
  }

  const handleUpdate = async (data: { name: string; code: string; streamIds?: string[] }) => {
    if (!editingSubject) return
    await updateSubject(editingSubject.id, data)

    toast.success(`${data.name} has been updated`)
  }

  const handleDelete = async () => {
    if (!deletingSubject) return
    await deleteSubject(deletingSubject.id)

    toast.error(`${deletingSubject.name} has been removed`)
  }

  const subjectColors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Subjects</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Button onClick={() => { setEditingSubject(null); setFormOpen(true) }}>
          <Plus size={16} className="mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search subjects..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search ? 'No subjects found' : 'No subjects yet'}
          description="Add your first subject to get started"
          actionLabel="Add Subject"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filtered.map((subject, index) => {
            const colorClass = subjectColors[index % subjectColors.length]

            return (
              <div
                key={subject.id}
                className="bg-white rounded-xl border p-5 shadow-sm"
              >

                {/* Header */}
                <div className="flex gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold ${colorClass}`}>
                    {subject.code.slice(0, 3)}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-400">{subject.code}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/dashboard/subjects/${subject.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye size={14} className="mr-1" />
                      View
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={() => { setEditingSubject(subject); setFormOpen(true) }}
                  >
                    <Pencil size={14} />
                  </Button>

                  <Button
                    variant="outline"
                    className="text-red-500"
                    onClick={() => setDeletingSubject(subject)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <SubjectFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingSubject(null) }}
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