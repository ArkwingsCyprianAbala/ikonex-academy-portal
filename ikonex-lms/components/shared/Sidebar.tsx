'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/shared/SidebarContext'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
  School,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Class Streams', href: '/dashboard/streams', icon: School },
  { label: 'Students', href: '/dashboard/students', icon: Users },
  { label: 'Subjects', href: '/dashboard/subjects', icon: BookOpen },
  { label: 'Assessments', href: '/dashboard/assessments', icon: GraduationCap },
  { label: 'Results', href: '/dashboard/results', icon: BarChart3 },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-primary/25">
          IA
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight text-white truncate">
            Ikonex Academy
          </p>
          <p className="text-sidebar-muted text-xs">Learning Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-primary-foreground' : 'text-sidebar-muted group-hover:text-white'
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border">
        <div className="rounded-lg bg-white/5 px-3 py-2.5">
          <p className="text-[11px] text-sidebar-muted leading-relaxed">
            © 2026 Ikonex Systems
          </p>
        </div>
      </div>
    </>
  )
}

export default function Sidebar() {
  const { isOpen, close } = useSidebar()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-72 sidebar-gradient text-white flex flex-col z-50 shadow-sidebar lg:hidden transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={close}
          className="absolute right-3 top-5 p-1.5 rounded-lg text-sidebar-muted hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <NavContent onNavigate={close} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 sidebar-gradient text-white flex-col z-50 shadow-sidebar">
        <NavContent />
      </aside>
    </>
  )
}
