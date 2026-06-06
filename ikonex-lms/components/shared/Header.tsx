'use client'

import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/shared/SidebarContext'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/streams': 'Class Streams',
  '/dashboard/students': 'Students',
  '/dashboard/subjects': 'Subjects',
  '/dashboard/assessments': 'Assessments',
  '/dashboard/results': 'Results',
  '/dashboard/reports': 'Reports',
}

const pageSubtitles: Record<string, string> = {
  '/dashboard': 'Overview of your academy',
  '/dashboard/streams': 'Manage class streams',
  '/dashboard/students': 'Student registry',
  '/dashboard/subjects': 'Curriculum subjects',
  '/dashboard/assessments': 'Score entry & grading',
  '/dashboard/results': 'Rankings & performance',
  '/dashboard/reports': 'PDF report cards',
}

export default function Header() {
  const pathname = usePathname()
  const { toggle } = useSidebar()

  const matchedKey =
    Object.keys(pageTitles).find(
      (k) => pathname === k || (k !== '/dashboard' && pathname.startsWith(k))
    ) ?? '/dashboard'

  const title = pageTitles[matchedKey] ?? 'Ikonex Academy'
  const subtitle = pageSubtitles[matchedKey] ?? 'Student Management System'

  return (
    <header className="h-16 glass-header flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={toggle}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </Button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
        </Button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-sm shadow-primary/20 ring-2 ring-primary/10">
          AD
        </div>
      </div>
    </header>
  )
}
