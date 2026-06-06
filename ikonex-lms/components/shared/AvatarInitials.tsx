import { cn } from '@/lib/utils'

interface AvatarInitialsProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

export default function AvatarInitials({
  initials,
  size = 'md',
  className,
}: AvatarInitialsProps) {
  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0 ring-2 ring-primary/10',
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
