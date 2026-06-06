import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

// GET /api/students/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        classStream: true,
        scores: { include: { subject: true } },
        results: true
      }
    })

    if (!student) {
      return errorResponse('Student not found', 404)
    }

    return successResponse(student)
  } catch (err) {
    console.error('GET student error:', err)
    return errorResponse('Failed to fetch student')
  }
}

// PUT /api/students/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const {
      firstName,
      lastName,
      studentNumber,
      gender,
      dateOfBirth,
      classStreamId
    } = body

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
      include: {
        classStream: true
      }
    })

    return successResponse(student)
  } catch (err) {
    console.error('PUT student error:', err)
    return errorResponse('Failed to update student')
  }
}

// DELETE /api/students/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.student.delete({
      where: { id }
    })

    return successResponse({
      message: 'Student deleted successfully'
    })
  } catch (err) {
    console.error('DELETE student error:', err)
    return errorResponse('Failed to delete student')
  }
}