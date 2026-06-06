import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { StudentResult } from '../hooks/useResults'

function getGradeRemark(grade: string): string {
  switch (grade) {
    case 'A': return 'Excellent'
    case 'B': return 'Very Good'
    case 'C': return 'Good'
    case 'D': return 'Satisfactory'
    default: return 'Needs Improvement'
  }
}

export function generateClassReport(
  streamName: string,
  results: StudentResult[]
): void {
  const doc = new jsPDF({ orientation: 'landscape' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // ── Header ──
  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, pageWidth, 38, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Ikonex Academy', pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Class Performance Report — ${streamName}`, pageWidth / 2, 25, { align: 'center' })

  doc.setFontSize(9)
  doc.text(
    `Academic Year: ${new Date().getFullYear()} · Generated: ${new Date().toLocaleDateString()}`,
    pageWidth / 2, 33, { align: 'center' }
  )

  // ── Summary Stats ──
  const avg = results.reduce((s, r) => s + r.averageScore, 0) / results.length
  const highest = Math.max(...results.map(r => r.averageScore))
  const lowest = Math.min(...results.map(r => r.averageScore))
  const passCount = results.filter(r => r.averageScore >= 50).length
  const gradeCount = (g: string) => results.filter(r => r.grade === g).length

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(14, 44, pageWidth - 28, 22, 2, 2, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)

  const stats = [
    `Students: ${results.length}`,
    `Class Avg: ${avg.toFixed(1)}%`,
    `Highest: ${highest.toFixed(1)}%`,
    `Lowest: ${lowest.toFixed(1)}%`,
    `Pass (≥50%): ${passCount}`,
    `Fail: ${results.length - passCount}`,
    `A: ${gradeCount('A')}`,
    `B: ${gradeCount('B')}`,
    `C: ${gradeCount('C')}`,
    `D: ${gradeCount('D')}`,
    `F: ${gradeCount('F')}`,
  ]

  const colWidth = (pageWidth - 28) / stats.length
  stats.forEach((stat, i) => {
    doc.text(stat, 18 + (i * colWidth), 57)
  })

  // ── Get All Unique Subjects ──
  const subjectSet = new Map<string, string>()
  results.forEach(r => {
    r.student.scores.forEach(s => {
      subjectSet.set(s.subject.id, s.subject.name)
    })
  })
  const subjects = Array.from(subjectSet.entries())

  // ── Build Table ──
  const headers = [
    'Pos', 'Student', 'Adm No',
    ...subjects.map(([, name]) => name.slice(0, 8)),
    'Total', 'Avg%', 'Grade', 'Remark'
  ]

  const rows = results.map(result => {
    const subjectScores = subjects.map(([id]) => {
      const score = result.student.scores.find(s => s.subject.id === id)
      return score ? String(score.total) : '—'
    })

    return [
      String(result.classPosition),
      `${result.student.firstName} ${result.student.lastName}`,
      result.student.studentNumber,
      ...subjectScores,
      result.totalMarks.toFixed(1),
      `${result.averageScore.toFixed(1)}%`,
      result.grade,
      getGradeRemark(result.grade)
    ]
  })

  autoTable(doc, {
    startY: 72,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 18, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (data) => {
      // Highlight grade column
      if (data.column.index === headers.length - 2) {
        const grade = data.cell.text[0]
        if (grade === 'A') data.cell.styles.textColor = [21, 128, 61]
        else if (grade === 'B') data.cell.styles.textColor = [29, 78, 216]
        else if (grade === 'C') data.cell.styles.textColor = [161, 98, 7]
        else if (grade === 'F') data.cell.styles.textColor = [185, 28, 28]
      }
    }
  })

  // ── Footer ──
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(
    'Ikonex Academy Management System — Confidential',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 6,
    { align: 'center' }
  )

  doc.save(`${streamName}_Class_Report.pdf`)
}