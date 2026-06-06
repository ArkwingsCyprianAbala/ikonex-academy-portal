'use client'

import { useState } from 'react'
import { useStudents } from '@/lib/hooks/useStudents'
import { useStreams } from '@/lib/hooks/useStreams'
import { toast } from 'sonner'
import StudentFormDialog from '@/components/shared/StudentFormDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/shared/PageHeader'
import AvatarInitials from '@/components/shared/AvatarInitials'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import type { Student } from '@/lib/hooks/useStudents'

export default function StudentsPage() {
  const { students, loading, createStudent, updateStudent, deleteStudent } =
    useStudents()
  const { streams } = useStreams()

  const [search, setSearch] = useState('')
  const [filterStream, setFilterStream] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)

  const filtered = students.filter((s) => {
    const matchSearch = `${s.firstName} ${s.lastName} ${s.studentNumber}`
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
      <PageHeader
        title="Students"
        description={`${students.length} student${students.length !== 1 ? 's' : ''} registered`}
      >
        <Button
          onClick={() => {
            setEditingStudent(null)
            setFormOpen(true)
          }}
        >
          <Plus size={16} className="mr-2" />
          <span className="hidden sm:inline">Register Student</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name or student number..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterStream} onValueChange={setFilterStream}>
          <SelectTrigger className="w-full sm:w-48 h-10">
            <SelectValue placeholder="All Streams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Streams</SelectItem>
            {streams.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading students..." />
      ) : filtered.length === 0 ? (
        <Card>
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
              !search && filterStream === 'all' ? 'Register Student' : undefined
            }
            onAction={() => setFormOpen(true)}
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Student</span>
              <span>Stream</span>
              <span>Gender</span>
              <span>Date of Birth</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarInitials
                      initials={`${student.firstName[0]}${student.lastName[0]}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.studentNumber}
                      </p>
                    </div>
                  </div>

                  <Badge variant="secondary" className="w-fit text-xs">
                    {student.classStream.name}
                  </Badge>

                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${
                      student.gender === 'MALE'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {student.gender === 'MALE' ? 'Male' : 'Female'}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {new Date(student.dateOfBirth).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-1">
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
                      <Trash2 size={15} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {students.length} students
              </p>
            </CardFooter>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((student) => (
              <Card key={student.id} className="p-4">
                <div className="flex items-start gap-3">
                  <AvatarInitials
                    initials={`${student.firstName[0]}${student.lastName[0]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {student.studentNumber}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {student.classStream.name}
                      </Badge>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          student.gender === 'MALE'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {student.gender === 'MALE' ? 'Male' : 'Female'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Link href={`/dashboard/students/${student.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye size={14} className="mr-1.5" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingStudent(student)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingStudent(student)}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
            <p className="text-xs text-muted-foreground text-center py-2">
              Showing {filtered.length} of {students.length} students
            </p>
          </div>
        </>
      )}

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
