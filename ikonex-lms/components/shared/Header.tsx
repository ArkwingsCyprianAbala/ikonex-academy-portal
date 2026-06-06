'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/streams': 'Class Streams',
  '/dashboard/students': 'Students',
  '/dashboard/subjects': 'Subjects',
  '/dashboard/assessments': 'Assessments',
  '/dashboard/results': 'Results',
  '/dashboard/reports': 'Reports',
}

export default function Header() {
  const pathname = usePathname()

  // Match exact or get parent path title
  const title = pageTitles[pathname] ??
    pageTitles[Object.keys(pageTitles).find(k => pathname.startsWith(k) && k !== '/dashboard') ?? ''] ??
    'Ikonex Academy'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-500">Ikonex Academy · Student Management System</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} className="text-slate-600" />
        </Button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          AD
        </div>
      </div>
    </header>
  )
}