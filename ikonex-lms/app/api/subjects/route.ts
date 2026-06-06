import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

// GET /api/subjects
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: { select: { streamSubjects: true } },
        streamSubjects: {
          include: { classStream: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    return successResponse(subjects)
  } catch {
    return errorResponse('Failed to fetch subjects')
  }
}

// POST /api/subjects
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, code, streamIds } = body

    if (!name || !code) {
      return errorResponse('Name and code are required', 400)
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        ...(streamIds && streamIds.length > 0 && {
          streamSubjects: {
            create: streamIds.map((sid: string) => ({ streamId: sid }))
          }
        })
      },
      include: {
        streamSubjects: { include: { classStream: true } },
        _count: { select: { streamSubjects: true } }
      }
    })
    return successResponse(subject, 201)
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && (error as { code: string }).code === 'P2002'
    ) {
      return errorResponse('Subject name or code already exists', 409)
    }
    return errorResponse('Failed to create subject')
  }
}