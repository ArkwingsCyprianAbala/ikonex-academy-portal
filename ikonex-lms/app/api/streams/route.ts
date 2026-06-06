import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

// GET /api/streams — fetch all streams
export async function GET() {
  try {
    const streams = await prisma.classStream.findMany({
      include: {
        _count: { select: { students: true, streamSubjects: true } }
      },
      orderBy: { name: 'asc' }
    })
    return successResponse(streams)
  } catch {
    return errorResponse('Failed to fetch streams')
  }
}

// POST /api/streams — create a new stream
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name || name.trim() === '') {
      return errorResponse('Stream name is required', 400)
    }

    const stream = await prisma.classStream.create({
      data: { name: name.trim() }
    })
    return successResponse(stream, 201)
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && (error as { code: string }).code === 'P2002'
    ) {
      return errorResponse('A stream with this name already exists', 409)
    }
    return errorResponse('Failed to create stream')
  }
}