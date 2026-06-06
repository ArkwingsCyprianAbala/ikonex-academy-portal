'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Student } from '@/lib/hooks/useStudents'
import { ClassStream } from '@/lib/hooks/useStreams'

interface FormData {
  firstName: string
  lastName: string
  studentNumber: string
  gender: 'MALE' | 'FEMALE' | ''
  dateOfBirth: string
  classStreamId: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Student, 'id' | 'classStream' | 'createdAt'>) => Promise<void>
  editingStudent?: Student | null
  streams: ClassStream[]
}

const defaultForm: FormData = {
  firstName: '',
  lastName: '',
  studentNumber: '',
  gender: '',
  dateOfBirth: '',
  classStreamId: ''
}

export default function StudentFormDialog({
  open, onClose, onSubmit, editingStudent, streams
}: Props) {
  const [form, setForm] = useState<FormData>(defaultForm)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (editingStudent) {
      setForm({
        firstName: editingStudent.firstName,
        lastName: editingStudent.lastName,
        studentNumber: editingStudent.studentNumber,
        gender: editingStudent.gender,
        dateOfBirth: editingStudent.dateOfBirth.split('T')[0],
        classStreamId: editingStudent.classStreamId
      })
    } else {
      setForm(defaultForm)
    }
    setErrors({})
    setServerError('')
  }, [editingStudent, open])

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!form.studentNumber.trim()) newErrors.studentNumber = 'Student number is required'
    if (!form.gender) newErrors.gender = 'Gender is required'
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!form.classStreamId) newErrors.classStreamId = 'Class stream is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    setServerError('')
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      await onSubmit(form as Omit<Student, 'id' | 'classStream' | 'createdAt'>)
      onClose()
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setServerError(axiosErr.response?.data?.error ?? 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingStudent ? 'Edit Student' : 'Register New Student'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          {/* First Name */}
          <div className="space-y-1">
            <Label>First Name</Label>
            <Input
              placeholder="John"
              value={form.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
            />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <Label>Last Name</Label>
            <Input
              placeholder="Doe"
              value={form.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
            />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>

          {/* Student Number */}
          <div className="space-y-1">
            <Label>Student Number</Label>
            <Input
              placeholder="STU-001"
              value={form.studentNumber}
              onChange={e => handleChange('studentNumber', e.target.value)}
            />
            {errors.studentNumber && <p className="text-xs text-red-500">{errors.studentNumber}</p>}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
            />
            {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <Label>Gender</Label>
            <Select
              value={form.gender}
              onValueChange={val => handleChange('gender', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
          </div>

          {/* Class Stream */}
          <div className="space-y-1">
            <Label>Class Stream</Label>
            <Select
              value={form.classStreamId}
              onValueChange={val => handleChange('classStreamId', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                {streams.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classStreamId && <p className="text-xs text-red-500">{errors.classStreamId}</p>}
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : editingStudent ? 'Update Student' : 'Register Student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}