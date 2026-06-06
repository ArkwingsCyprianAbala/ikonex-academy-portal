import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { StudentResult } from '../hooks/useResults'

const SCHOOL_NAME = 'Ikonex Academy'
const SCHOOL_SUBTITLE = 'Student Report Card'

function getGradeRemark(grade: string): string {
  switch (grade) {
    case 'A': return 'Excellent'
    case 'B': return 'Very Good'
    case 'C': return 'Good'
    case 'D': return 'Satisfactory'
    default: return 'Needs Improvement'
  }
}

function getSubjectGrade(total: number): string {
  if (total >= 80) return 'A'
  if (total >= 65) return 'B'
  if (total >= 50) return 'C'
  if (total >= 40) return 'D'
  return 'F'
}

export function generateStudentReportCard(result: StudentResult): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // ── Header Background ──
  doc.setFillColor(30, 64, 175) // blue-800
  doc.rect(0, 0, pageWidth, 38, 'F')

  // School Name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(SCHOOL_NAME, pageWidth / 2, 16, { align: 'center' })

  // Subtitle
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(SCHOOL_SUBTITLE, pageWidth / 2, 26, { align: 'center' })

  // Academic Year
  doc.setFontSize(9)
  doc.text(`Academic Year: ${new Date().getFullYear()}`, pageWidth / 2, 34, { align: 'center' })

  // ── Student Info Box ──
  doc.setFillColor(241, 245, 249) // slate-100
  doc.roundedRect(14, 44, pageWidth - 28, 36, 3, 3, 'F')

  doc.setTextColor(30, 41, 59) // slate-800
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(
    `${result.student.firstName} ${result.student.lastName}`,
    20, 54
  )

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139) // slate-500

  const dob = result.student.scores.length > 0
    ? '' : ''

  doc.text(`Student No: ${result.student.studentNumber}`, 20, 62)
  doc.text(`Class Stream: ${result.student.classStream.name}`, 20, 70)
  doc.text(`Class Position: ${result.classPosition}`, 110, 62)
  doc.text(`Grade: ${result.grade}`, 110, 70)

  // ── Section Title ──
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('ACADEMIC PERFORMANCE', 14, 92)

  // Underline
  doc.setDrawColor(30, 64, 175)
  doc.setLineWidth(0.5)
  doc.line(14, 94, pageWidth - 14, 94)

  // ── Scores Table ──
  const tableData = result.student.scores.map(score => {
    const grade = getSubjectGrade(score.total)
    return [
      score.subject.name,
      score.subject.code,
      String(score.examScore),
      String(score.caScore),
      String(score.total),
      grade,
      getGradeRemark(grade)
    ]
  })

  autoTable(doc, {
    startY: 98,
    head: [['Subject', 'Code', 'Exam (70)', 'CA (30)', 'Total', 'Grade', 'Remark']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 30, halign: 'center' }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  })

  // ── Summary Box ──
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY + 10

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(14, finalY, pageWidth - 28, 32, 3, 3, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)

  const col1 = 24
  const col2 = 80
  const col3 = 136
  const row1 = finalY + 11
  const row2 = finalY + 22

  doc.text('Total Marks:', col1, row1)
  doc.setFont('helvetica', 'normal')
  doc.text(String(result.totalMarks.toFixed(1)), col1 + 28, row1)

  doc.setFont('helvetica', 'bold')
  doc.text('Average Score:', col2, row1)
  doc.setFont('helvetica', 'normal')
  doc.text(`${result.averageScore.toFixed(1)}%`, col2 + 32, row1)

  doc.setFont('helvetica', 'bold')
  doc.text('Overall Grade:', col3, row1)
  doc.setFont('helvetica', 'normal')
  doc.text(result.grade, col3 + 30, row1)

  doc.setFont('helvetica', 'bold')
  doc.text('Class Position:', col1, row2)
  doc.setFont('helvetica', 'normal')
  doc.text(`${result.classPosition} of ${result.classPosition}`, col1 + 30, row2)

  doc.setFont('helvetica', 'bold')
  doc.text('Remark:', col2, row2)
  doc.setFont('helvetica', 'normal')
  doc.text(getGradeRemark(result.grade), col2 + 18, row2)

  // ── Grading Scale ──
  const scaleY = finalY + 44
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('GRADING SCALE', 14, scaleY)
  doc.setDrawColor(30, 64, 175)
  doc.line(14, scaleY + 2, pageWidth - 14, scaleY + 2)

  autoTable(doc, {
    startY: scaleY + 5,
    head: [['Grade', 'Marks Range', 'Remark']],
    body: [
      ['A', '80 – 100', 'Excellent'],
      ['B', '65 – 79', 'Very Good'],
      ['C', '50 – 64', 'Good'],
      ['D', '40 – 49', 'Satisfactory'],
      ['F', '0 – 39', 'Needs Improvement'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 8, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 50 }
    },
    tableWidth: 115
  })

  // ── Signature Lines ──
  const sigY = doc.internal.pageSize.getHeight() - 30
  doc.setDrawColor(148, 163, 184)
  doc.setLineWidth(0.3)

  doc.line(14, sigY, 70, sigY)
  doc.line(80, sigY, 136, sigY)
  doc.line(146, sigY, pageWidth - 14, sigY)

  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text("Class Teacher's Signature", 14, sigY + 6)
  doc.text("Principal's Signature", 80, sigY + 6)
  doc.text('Date', 146, sigY + 6)

  // ── Footer ──
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Generated by Ikonex Academy Management System · ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'center' }
  )

  // ── Save ──
  const fileName = `${result.student.lastName}_${result.student.firstName}_ReportCard.pdf`
  doc.save(fileName)
}