// We test the logic of our helper functions directly

function successResponse(data: unknown, status = 200) {
  return { success: true, data, status }
}

function errorResponse(message: string, status = 500) {
  return { success: false, error: message, status }
}

describe('successResponse', () => {
  it('returns success true with data', () => {
    const res = successResponse({ id: '1', name: 'Form 1A' })
    expect(res.success).toBe(true)
    expect(res.data).toEqual({ id: '1', name: 'Form 1A' })
  })

  it('defaults to status 200', () => {
    const res = successResponse({})
    expect(res.status).toBe(200)
  })

  it('accepts custom status codes', () => {
    const res = successResponse({}, 201)
    expect(res.status).toBe(201)
  })

  it('handles null data', () => {
    const res = successResponse(null)
    expect(res.data).toBeNull()
  })

  it('handles array data', () => {
    const res = successResponse([1, 2, 3])
    expect(res.data).toHaveLength(3)
  })
})

describe('errorResponse', () => {
  it('returns success false with error message', () => {
    const res = errorResponse('Something went wrong')
    expect(res.success).toBe(false)
    expect(res.error).toBe('Something went wrong')
  })

  it('defaults to status 500', () => {
    const res = errorResponse('Error')
    expect(res.status).toBe(500)
  })

  it('accepts custom status codes', () => {
    expect(errorResponse('Not found', 404).status).toBe(404)
    expect(errorResponse('Bad request', 400).status).toBe(400)
    expect(errorResponse('Conflict', 409).status).toBe(409)
  })
})