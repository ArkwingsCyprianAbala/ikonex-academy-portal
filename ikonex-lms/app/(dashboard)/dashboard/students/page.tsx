'use client'

import { useState } from 'react'
import { useStudents } from '@/lib/hooks/useStudents'
import { useStreams } from '@/lib/hooks/useStreams'
import { toast } from 'sonner'
import StudentFormDialog from '@/components/shared/StudentFormDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Users, Plus, Search, Pencil,
  Trash2, Eye, Loader2
} from 'lucide-react'
import Link from 'next/link'
import type { Student } from '@/lib/hooks/useStudents'

export default function StudentsPage() {
  const { students, loading, createStudent, updateStudent, deleteStudent } = useStudents()
  const { streams } = useStreams()

  const [search, setSearch] = useState('')
  const [filterStream, setFilterStream] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)

  // Filter logic
  const filtered = students.filter(s => {
    const matchSearch =
      `${s.firstName} ${s.lastName} ${s.studentNumber}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchStream =
      filterStream === 'all' || s.classStreamId === filterStream

    return matchSearch && matchStream
  })

  const handleCreate = async (
    data: Omit<Student, 'id' | 'classStream' | 'createdAt'>
  ) => {
    await createStudent(data)
    toast.success(`${data.firstName} ${data.lastName} added successfully`)
  }

  const handleUpdate = async (
    data: Omit<Student, 'id' | 'classStream' | 'createdAt'>
  ) => {
    if (!editingStudent) return
    await updateStudent(editingStudent.id, data)
    toast.success('Student info updated successfully')
  }

  const handleDelete = async () => {
    if (!deletingStudent) return
    await deleteStudent(deletingStudent.id)
    toast.error(
      `${deletingStudent.firstName} ${deletingStudent.lastName} removed`
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Students</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {students.length} student{students.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        <Button onClick={() => { setEditingStudent(null); setFormOpen(true) }}>
          <Plus size={16} className="mr-2" />
          Register Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or student number..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterStream} onValueChange={setFilterStream}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Streams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Streams</SelectItem>
            {streams.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={Users}
            title={
              search || filterStream !== 'all'
                ? 'No students match your filters'
                : 'No students yet'
            }
            description={
              search || filterStream !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Register your first student to get started.'
            }
            actionLabel={
              !search && filterStream === 'all'
                ? 'Register Student'
                : undefined
            }
            onAction={() => setFormOpen(true)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Student</span>
            <span>Stream</span>
            <span>Gender</span>
            <span>Date of Birth</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {filtered.map(student => (
              <div
                key={student.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {student.studentNumber}
                    </p>
                  </div>
                </div>

                <Badge variant="secondary" className="w-fit text-xs">
                  {student.classStream.name}
                </Badge>

                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${
                    student.gender === 'MALE'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-pink-50 text-pink-700'
                  }`}
                >
                  {student.gender === 'MALE' ? 'Male' : 'Female'}
                </span>

                <span className="text-sm text-slate-500">
                  {new Date(student.dateOfBirth).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>

                <div className="flex items-center gap-1.5">
                  <Link href={`/dashboard/students/${student.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye size={15} />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingStudent(student)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil size={15} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDeletingStudent(student)}
                  >
                    <Trash2 size={15} className="text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {students.length} students
            </p>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <StudentFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingStudent(null)
        }}
        onSubmit={editingStudent ? handleUpdate : handleCreate}
        editingStudent={editingStudent}
        streams={streams}
      />

      <ConfirmDialog
        open={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDelete}
        title={`Delete ${deletingStudent?.firstName} ${deletingStudent?.lastName}?`}
        description="This will permanently delete the student and all their scores and results."
      />
    </div>
  )
}