import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

function calculateGrade(average: number): string {
  if (average >= 80) return 'A'
  if (average >= 65) return 'B'
  if (average >= 50) return 'C'
  if (average >= 40) return 'D'
  return 'F'
}

type StudentWithScores = {
  id: string
  scores: { total: number }[]
}

type StudentResult = {
  studentId: string
  totalMarks: number
  averageScore: number
  grade: string
}

// POST /api/results — process results for an entire stream
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { streamId } = body

    if (!streamId) return errorResponse('streamId is required', 400)

    // Get all students in this stream with their scores
    const students = await prisma.student.findMany({
      where: { classStreamId: streamId },
      include: { scores: true }
    })

    if (students.length === 0) {
      return errorResponse('No students found in this stream', 404)
    }

    // Calculate totals and averages for each student
    const studentResults: StudentResult[] = students.map((student: StudentWithScores) => {
      const totalMarks = student.scores.reduce((sum, s) => sum + s.total, 0)
      const averageScore = student.scores.length > 0
        ? totalMarks / student.scores.length
        : 0
      const grade = calculateGrade(averageScore)
      return { studentId: student.id, totalMarks, averageScore, grade }
    })

    // Sort by totalMarks descending to assign positions
    studentResults.sort((a: StudentResult, b: StudentResult) => b.totalMarks - a.totalMarks)

    // Upsert results with class positions
    const upsertPromises = studentResults.map((result: StudentResult, index: number) =>
      prisma.result.upsert({
        where: { studentId: result.studentId },
        update: {
          totalMarks: result.totalMarks,
          averageScore: result.averageScore,
          grade: result.grade,
          classPosition: index + 1
        },
        create: {
          studentId: result.studentId,
          totalMarks: result.totalMarks,
          averageScore: result.averageScore,
          grade: result.grade,
          classPosition: index + 1
        }
      })
    )

    await Promise.all(upsertPromises)

    return successResponse({
      message: `Results processed for ${students.length} students`,
      results: studentResults
    })
  } catch {
    return errorResponse('Failed to process results')
  }
}

// GET /api/results?streamId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const streamId = searchParams.get('streamId')
    const studentId = searchParams.get('studentId')

    const results = await prisma.result.findMany({
      where: {
        student: {
          ...(streamId && { classStreamId: streamId }),
          ...(studentId && { id: studentId })
        }
      },
      include: {
        student: {
          include: {
            classStream: true,
            scores: { include: { subject: true } }
          }
        }
      },
      orderBy: { classPosition: 'asc' }
    })
    return successResponse(results)
  } catch {
    return errorResponse('Failed to fetch results')
  }
}