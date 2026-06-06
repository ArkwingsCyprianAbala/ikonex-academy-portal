// Tests for grading and results processing logic

function calculateGrade(average: number): string {
  if (average >= 80) return 'A'
  if (average >= 65) return 'B'
  if (average >= 50) return 'C'
  if (average >= 40) return 'D'
  return 'F'
}

function calculateTotal(examScore: number, caScore: number): number {
  return examScore + caScore
}

function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0
  return scores.reduce((sum, s) => sum + s, 0) / scores.length
}

function rankStudents(students: { id: string; total: number }[]) {
  return [...students]
    .sort((a, b) => b.total - a.total)
    .map((s, index) => ({ ...s, position: index + 1 }))
}

// ── Grade Calculation Tests ──
describe('calculateGrade', () => {
  it('returns A for scores 80 and above', () => {
    expect(calculateGrade(80)).toBe('A')
    expect(calculateGrade(95)).toBe('A')
    expect(calculateGrade(100)).toBe('A')
  })

  it('returns B for scores between 65 and 79', () => {
    expect(calculateGrade(65)).toBe('B')
    expect(calculateGrade(72)).toBe('B')
    expect(calculateGrade(79)).toBe('B')
  })

  it('returns C for scores between 50 and 64', () => {
    expect(calculateGrade(50)).toBe('C')
    expect(calculateGrade(57)).toBe('C')
    expect(calculateGrade(64)).toBe('C')
  })

  it('returns D for scores between 40 and 49', () => {
    expect(calculateGrade(40)).toBe('D')
    expect(calculateGrade(45)).toBe('D')
    expect(calculateGrade(49)).toBe('D')
  })

  it('returns F for scores below 40', () => {
    expect(calculateGrade(39)).toBe('F')
    expect(calculateGrade(0)).toBe('F')
    expect(calculateGrade(20)).toBe('F')
  })

  it('handles boundary values correctly', () => {
    expect(calculateGrade(79.9)).toBe('B')
    expect(calculateGrade(64.9)).toBe('C')
    expect(calculateGrade(49.9)).toBe('D')
    expect(calculateGrade(39.9)).toBe('F')
  })
})

// ── Score Total Tests ──
describe('calculateTotal', () => {
  it('correctly adds exam and CA scores', () => {
    expect(calculateTotal(60, 25)).toBe(85)
    expect(calculateTotal(70, 30)).toBe(100)
    expect(calculateTotal(0, 0)).toBe(0)
  })

  it('handles decimal scores', () => {
    expect(calculateTotal(55.5, 24.5)).toBe(80)
  })

  it('returns correct total at boundaries', () => {
    expect(calculateTotal(70, 30)).toBe(100)
    expect(calculateTotal(0, 0)).toBe(0)
  })
})

// ── Average Calculation Tests ──
describe('calculateAverage', () => {
  it('calculates correct average', () => {
    expect(calculateAverage([80, 70, 90])).toBeCloseTo(80)
    expect(calculateAverage([100, 0])).toBe(50)
  })

  it('returns 0 for empty array', () => {
    expect(calculateAverage([])).toBe(0)
  })

  it('handles single score', () => {
    expect(calculateAverage([75])).toBe(75)
  })

  it('handles all same scores', () => {
    expect(calculateAverage([60, 60, 60])).toBe(60)
  })
})

// ── Ranking Tests ──
describe('rankStudents', () => {
  const students = [
    { id: '1', total: 240 },
    { id: '2', total: 310 },
    { id: '3', total: 275 },
    { id: '4', total: 190 },
  ]

  it('ranks students in descending order of total', () => {
    const ranked = rankStudents(students)
    expect(ranked[0].id).toBe('2')
    expect(ranked[1].id).toBe('3')
    expect(ranked[2].id).toBe('1')
    expect(ranked[3].id).toBe('4')
  })

  it('assigns correct positions starting from 1', () => {
    const ranked = rankStudents(students)
    expect(ranked[0].position).toBe(1)
    expect(ranked[1].position).toBe(2)
    expect(ranked[2].position).toBe(3)
    expect(ranked[3].position).toBe(4)
  })

  it('does not mutate the original array', () => {
    const original = [...students]
    rankStudents(students)
    expect(students).toEqual(original)
  })

  it('handles single student', () => {
    const ranked = rankStudents([{ id: '1', total: 100 }])
    expect(ranked[0].position).toBe(1)
  })

  it('handles empty array', () => {
    expect(rankStudents([])).toEqual([])
  })
})