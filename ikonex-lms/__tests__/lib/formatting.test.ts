function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

function formatStudentName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function generateStudentNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count).padStart(3, '0')}`
}

describe('getInitials', () => {
  it('returns uppercase initials from first and last name', () => {
    expect(getInitials('John', 'Doe')).toBe('JD')
    expect(getInitials('alice', 'smith')).toBe('AS')
  })

  it('handles single character names', () => {
    expect(getInitials('J', 'D')).toBe('JD')
  })
})

describe('formatStudentName', () => {
  it('combines first and last name with a space', () => {
    expect(formatStudentName('John', 'Doe')).toBe('John Doe')
  })

  it('trims whitespace from names', () => {
    expect(formatStudentName('  John  ', '  Doe  ')).toBe('John Doe')
  })
})

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    const result = formatDate('2010-05-15T00:00:00.000Z')
    expect(result).toContain('2010')
    expect(result).toContain('May')
    expect(result).toContain('15')
  })
})

describe('generateStudentNumber', () => {
  it('pads numbers to 3 digits', () => {
    expect(generateStudentNumber('STU', 1)).toBe('STU-001')
    expect(generateStudentNumber('STU', 10)).toBe('STU-010')
    expect(generateStudentNumber('STU', 100)).toBe('STU-100')
  })

  it('uses the correct prefix', () => {
    expect(generateStudentNumber('IKA', 5)).toBe('IKA-005')
  })
})