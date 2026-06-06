import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

// GET /api/scores?studentId=xxx&subjectId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const subjectId = searchParams.get('subjectId')

    const scores = await prisma.score.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(subjectId && { subjectId })
      },
      include: {
        student: { include: { classStream: true } },
        subject: true
      }
    })
    return successResponse(scores)
  } catch {
    return errorResponse('Failed to fetch scores')
  }
}

// POST /api/scores
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, subjectId, examScore, caScore } = body

    // Validate score ranges
    if (examScore < 0 || examScore > 70) {
      return errorResponse('Exam score must be between 0 and 70', 400)
    }
    if (caScore < 0 || caScore > 30) {
      return errorResponse('CA score must be between 0 and 30', 400)
    }

    const total = examScore + caScore

    const score = await prisma.score.create({
      data: { studentId, subjectId, examScore, caScore, total },
      include: { subject: true, student: true }
    })
    return successResponse(score, 201)
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && (error as { code: string }).code === 'P2002'
    ) {
      return errorResponse('Score for this student and subject already exists', 409)
    }
    return errorResponse('Failed to record score')
  }
}