import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: number
  label?: string
}

export default function LoadingSpinner({
  className,
  size = 28,
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 gap-3',
        className
      )}
      role="status"
      aria-label={label}
    >
      <Loader2 size={size} className="animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
