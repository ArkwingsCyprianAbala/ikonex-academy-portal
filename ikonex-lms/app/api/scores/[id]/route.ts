import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { examScore, caScore } = body

    if (examScore < 0 || examScore > 70) {
      return errorResponse('Exam score must be between 0 and 70', 400)
    }
    if (caScore < 0 || caScore > 30) {
      return errorResponse('CA score must be between 0 and 30', 400)
    }

    const total = examScore + caScore
    const score = await prisma.score.update({
      where: { id },
      data: { examScore, caScore, total }
    })
    return successResponse(score)
  } catch {
    return errorResponse('Failed to update score')
  }
}

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    await prisma.score.delete({ where: { id } })
    return successResponse({ message: 'Score deleted successfully' })
  } catch {
    return errorResponse('Failed to delete score')
  }
}