'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ClassStream } from '@/lib/hooks/useStreams'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  editingStream?: ClassStream | null
}

export default function StreamFormDialog({ open, onClose, onSubmit, editingStream }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingStream) {
      setName(editingStream.name)
    } else {
      setName('')
    }
    setError('')
  }, [editingStream, open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Stream name is required')
      return
    }
    try {
      setLoading(true)
      await onSubmit(name.trim())
      onClose()
    } catch (err: unknown) {
      if (
        typeof err === 'object' && err !== null &&
        'response' in err
      ) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setError(axiosErr.response?.data?.error ?? 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingStream ? 'Edit Class Stream' : 'Create Class Stream'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Stream Name</Label>
            <Input
              id="name"
              placeholder="e.g. Form 1A"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : editingStream ? 'Update Stream' : 'Create Stream'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}