export const gradeColorMap: Record<string, string> = {
  A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  B: 'bg-blue-50 text-blue-700 border-blue-200',
  C: 'bg-amber-50 text-amber-700 border-amber-200',
  D: 'bg-orange-50 text-orange-700 border-orange-200',
  F: 'bg-red-50 text-red-700 border-red-200',
}

export function getGradeColor(grade: string): string {
  return gradeColorMap[grade] ?? 'bg-muted text-muted-foreground border-border'
}

export function getPositionStyle(position: number): string {
  if (position === 1) return 'bg-amber-400 text-white shadow-sm'
  if (position === 2) return 'bg-slate-400 text-white shadow-sm'
  if (position === 3) return 'bg-amber-700 text-white shadow-sm'
  return 'bg-muted text-muted-foreground'
}

export const subjectColorPalette = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
]
