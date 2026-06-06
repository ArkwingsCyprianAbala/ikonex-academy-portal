import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        classStream: true,
        scores: { include: { subject: true } },
        results: true
      }
    })
    if (!student) return errorResponse('Student not found', 404)
    return successResponse(student)
  } catch {
    return errorResponse('Failed to fetch student')
  }
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { firstName, lastName, studentNumber, gender, dateOfBirth, classStreamId } = body

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        studentNumber: studentNumber?.trim(),
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        classStreamId
      },
      include: { classStream: true }
    })
    return successResponse(student)
  } catch {
    return errorResponse('Failed to update student')
  }
}

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    await prisma.student.delete({ where: { id } })
    return successResponse({ message: 'Student deleted successfully' })
  } catch {
    return errorResponse('Failed to delete student')
  }
}