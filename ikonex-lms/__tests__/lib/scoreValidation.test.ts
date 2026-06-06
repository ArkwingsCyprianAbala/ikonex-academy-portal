interface ScoreValidationResult {
  valid: boolean
  error?: string
}

function validateExamScore(score: number): ScoreValidationResult {
  if (score === undefined || score === null || isNaN(score)) {
    return { valid: false, error: 'Exam score is required' }
  }
  if (score < 0 || score > 70) {
    return { valid: false, error: 'Exam score must be between 0 and 70' }
  }
  return { valid: true }
}

function validateCAScore(score: number): ScoreValidationResult {
  if (score === undefined || score === null || isNaN(score)) {
    return { valid: false, error: 'CA score is required' }
  }
  if (score < 0 || score > 30) {
    return { valid: false, error: 'CA score must be between 0 and 30' }
  }
  return { valid: true }
}

function validateScoreEntry(examScore: number, caScore: number): ScoreValidationResult {
  const examResult = validateExamScore(examScore)
  if (!examResult.valid) return examResult

  const caResult = validateCAScore(caScore)
  if (!caResult.valid) return caResult

  return { valid: true }
}

// ── Exam Score Validation ──
describe('validateExamScore', () => {
  it('accepts valid exam scores', () => {
    expect(validateExamScore(0).valid).toBe(true)
    expect(validateExamScore(35).valid).toBe(true)
    expect(validateExamScore(70).valid).toBe(true)
  })

  it('rejects scores above 70', () => {
    const result = validateExamScore(71)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('70')
  })

  it('rejects negative scores', () => {
    const result = validateExamScore(-1)
    expect(result.valid).toBe(false)
  })

  it('rejects NaN', () => {
    const result = validateExamScore(NaN)
    expect(result.valid).toBe(false)
  })

  it('accepts boundary values', () => {
    expect(validateExamScore(0).valid).toBe(true)
    expect(validateExamScore(70).valid).toBe(true)
  })
})

// ── CA Score Validation ──
describe('validateCAScore', () => {
  it('accepts valid CA scores', () => {
    expect(validateCAScore(0).valid).toBe(true)
    expect(validateCAScore(15).valid).toBe(true)
    expect(validateCAScore(30).valid).toBe(true)
  })

  it('rejects scores above 30', () => {
    const result = validateCAScore(31)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('30')
  })

  it('rejects negative scores', () => {
    expect(validateCAScore(-1).valid).toBe(false)
  })
})

// ── Combined Score Validation ──
describe('validateScoreEntry', () => {
  it('accepts valid exam and CA combination', () => {
    expect(validateScoreEntry(60, 25).valid).toBe(true)
    expect(validateScoreEntry(70, 30).valid).toBe(true)
    expect(validateScoreEntry(0, 0).valid).toBe(true)
  })

  it('fails fast on invalid exam score', () => {
    const result = validateScoreEntry(80, 25)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('70')
  })

  it('catches invalid CA score when exam is valid', () => {
    const result = validateScoreEntry(60, 35)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('30')
  })
})