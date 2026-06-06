import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue: {
    icon: 'bg-blue-50 text-blue-600 ring-blue-100',
    accent: 'from-blue-500/10 to-transparent',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    accent: 'from-emerald-500/10 to-transparent',
  },
  purple: {
    icon: 'bg-violet-50 text-violet-600 ring-violet-100',
    accent: 'from-violet-500/10 to-transparent',
  },
  orange: {
    icon: 'bg-orange-50 text-orange-600 ring-orange-100',
    accent: 'from-orange-500/10 to-transparent',
  },
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div className="card-elevated p-5 flex items-start gap-4 group hover:shadow-card-hover transition-all duration-200 relative overflow-hidden">
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          colors.accent
        )}
      />
      <div
        className={cn(
          'relative p-3 rounded-xl ring-1',
          colors.icon
        )}
      >
        <Icon size={22} />
      </div>
      <div className="relative flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/80 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
