import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

// GET /api/students?streamId=xxx — fetch all or by stream
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const streamId = searchParams.get('streamId')

    const students = await prisma.student.findMany({
      where: streamId ? { classStreamId: streamId } : undefined,
      include: { classStream: true },
      orderBy: { firstName: 'asc' }
    })
    return successResponse(students)
  } catch {
    return errorResponse('Failed to fetch students')
  }
}

// POST /api/students — register a new student
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, studentNumber, gender, dateOfBirth, classStreamId } = body

    if (!firstName || !lastName || !studentNumber || !gender || !dateOfBirth || !classStreamId) {
      return errorResponse('All fields are required', 400)
    }

    const student = await prisma.student.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentNumber: studentNumber.trim(),
        gender,
        dateOfBirth: new Date(dateOfBirth),
        classStreamId
      },
      include: { classStream: true }
    })
    return successResponse(student, 201)
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && (error as { code: string }).code === 'P2002'
    ) {
      return errorResponse('Student number already exists', 409)
    }
    return errorResponse('Failed to register student')
  }
}