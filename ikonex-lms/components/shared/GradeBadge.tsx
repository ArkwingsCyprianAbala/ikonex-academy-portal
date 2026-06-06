import { cn } from '@/lib/utils'
import { getGradeColor } from '@/lib/grade-colors'

interface GradeBadgeProps {
  grade: string
  className?: string
}

export default function GradeBadge({ grade, className }: GradeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full border',
        getGradeColor(grade),
        className
      )}
    >
      {grade}
    </span>
  )
}
