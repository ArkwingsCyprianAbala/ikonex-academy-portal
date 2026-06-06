'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
  School
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Class Streams',
    href: '/dashboard/streams',
    icon: School
  },
  {
    label: 'Students',
    href: '/dashboard/students',
    icon: Users
  },
  {
    label: 'Subjects',
    href: '/dashboard/subjects',
    icon: BookOpen
  },
  {
    label: 'Assessments',
    href: '/dashboard/assessments',
    icon: GraduationCap
  },
  {
    label: 'Results',
    href: '/dashboard/results',
    icon: BarChart3
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: FileText
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
          IA
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Ikonex Academy</p>
          <p className="text-slate-400 text-xs">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">© 2026 Ikonex Systems</p>
      </div>
    </aside>
  )
}