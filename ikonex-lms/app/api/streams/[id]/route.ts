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
    const stream = await prisma.classStream.findUnique({
      where: { id },
      include: {
        students: { orderBy: { firstName: 'asc' } },
        streamSubjects: {
          include: { subject: true }
        }
      }
    })
    if (!stream) return errorResponse('Stream not found', 404)
    return successResponse(stream)
  } catch (err) {
    console.error('GET /api/streams/[id] error:', err)
    return errorResponse('Failed to fetch stream')
  }
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { name } = body

    if (!name || name.trim() === '') {
      return errorResponse('Stream name is required', 400)
    }

    const stream = await prisma.classStream.update({
      where: { id },
      data: { name: name.trim() }
    })
    return successResponse(stream)
  } catch (err) {
    console.error('PUT /api/streams/[id] error:', err)
    return errorResponse('Failed to update stream')
  }
}

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    await prisma.classStream.delete({ where: { id } })
    return successResponse({ message: 'Stream deleted successfully' })
  } catch (err) {
    console.error('DELETE /api/streams/[id] error:', err)
    return errorResponse('Failed to delete stream')
  }
}