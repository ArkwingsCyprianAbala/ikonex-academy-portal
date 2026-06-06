'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Subject } from '@/lib/hooks/useSubjects'
import { ClassStream } from '@/lib/hooks/useStreams'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    code: string
    streamIds?: string[]
  }) => Promise<void>
  editingSubject?: (Subject & {
    streamSubjects?: { classStream: ClassStream }[]
  }) | null
  streams: ClassStream[]
}

export default function SubjectFormDialog({
  open, onClose, onSubmit, editingSubject, streams
}: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [selectedStreams, setSelectedStreams] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name)
      setCode(editingSubject.code)
      setSelectedStreams(
        editingSubject.streamSubjects?.map(ss => ss.classStream.id) ?? []
      )
    } else {
      setName('')
      setCode('')
      setSelectedStreams([])
    }
    setErrors({})
    setServerError('')
  }, [editingSubject, open])

  const toggleStream = (streamId: string) => {
    setSelectedStreams(prev =>
      prev.includes(streamId)
        ? prev.filter(id => id !== streamId)
        : [...prev, streamId]
    )
  }

  const validate = () => {
    const newErrors: { name?: string; code?: string } = {}
    if (!name.trim()) newErrors.name = 'Subject name is required'
    if (!code.trim()) newErrors.code = 'Subject code is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        streamIds: selectedStreams
      })
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
            {editingSubject ? 'Edit Subject' : 'Create New Subject'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name & Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Subject Name</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label>Subject Code</Label>
              <Input
                placeholder="e.g. MATH101"
                value={code}
                onChange={e => { setCode(e.target.value); setErrors(p => ({ ...p, code: '' })) }}
              />
              {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
            </div>
          </div>

          {/* Stream Assignment */}
          <div className="space-y-2">
            <Label>
              Assign to Streams
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </Label>

            {streams.length === 0 ? (
              <p className="text-sm text-slate-400 bg-slate-50 rounded-lg px-4 py-3">
                No streams available. Create a stream first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {streams.map(stream => {
                  const isSelected = selectedStreams.includes(stream.id)
                  return (
                    <button
                      key={stream.id}
                      type="button"
                      onClick={() => toggleStream(stream.id)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {stream.name}
                      {isSelected && <Check size={14} />}
                    </button>
                  )
                })}
              </div>
            )}

            {selectedStreams.length > 0 && (
              <p className="text-xs text-slate-500">
                Assigned to {selectedStreams.length} stream{selectedStreams.length > 1 ? 's' : ''}
              </p>
            )}
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
            {loading ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}