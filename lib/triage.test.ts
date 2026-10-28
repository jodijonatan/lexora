import { describe, it, expect } from 'vitest'
import { triage, completeness } from './triage'
import { mask } from './mask'
import { createCaseId, generateSecurePin } from './case-id'
import { registerSchema } from '../src/modules/users/users.service'

describe('Lexora Triage & Completeness Helpers', () => {
  it('marks recent financial loss as critical', () => {
    expect(triage({ typeId: 'fraud', amount: 100000, hoursAgo: 2 }).urgency).toBe('KRITIS')
  })

  it('marks account takeover as high', () => {
    expect(triage({ typeId: 'hacked', accountTaken: true }).urgency).toBe('TINGGI')
  })

  it('marks ransomware with organization context as critical', () => {
    expect(triage({ typeId: 'ransomware', organization: true }).urgency).toBe('KRITIS')
  })

  it('marks minor involvement as critical', () => {
    expect(triage({ typeId: 'bullying', minor: true }).urgency).toBe('KRITIS')
  })

  it('marks data breach as high urgency', () => {
    expect(triage({ typeId: 'breach' }).urgency).toBe('TINGGI')
  })

  it('marks low-urgency non-financial report', () => {
    expect(triage({ typeId: 'other', amount: 0, hoursAgo: 100 }).urgency).toBe('RENDAH')
  })

  it('scores completeness and missing fields accurately', () => {
    const r = completeness({
      typeId: 'fraud',
      occurredAt: '2026-10-01',
      narrative: 'x'.repeat(200),
      platform: 'WhatsApp',
      loss: 'none',
      suspect: 'unknown',
      evidence: 'proof',
      contact: 'anonim',
    })
    expect(r.score).toBe(100)
    expect(r.missing).toHaveLength(0)
  })

  it('detects missing fields in incomplete report', () => {
    const r = completeness({
      typeId: 'fraud',
      occurredAt: '',
      narrative: 'Pendek',
    })
    expect(r.score).toBeLessThan(50)
    expect(r.missing).toContain('Tambahkan waktu kejadian bila ingat.')
    expect(r.missing).toContain('Lengkapi kronologi hingga sekitar 200 karakter.')
  })
})

describe('Privacy Masking Helper', () => {
  it('masks all but final three characters for strings longer than 3 characters', () => {
    expect(mask('123456789')).toBe('██████789')
  })

  it('masks strings with 3 or fewer characters completely with blocks', () => {
    expect(mask('12')).toBe('██')
    expect(mask('123')).toBe('███')
    expect(mask('')).toBe('')
  })
})

describe('Case ID & Secure PIN Generation (Regression Tests for AUD-003, AUD-005)', () => {
  it('generates case ID matching LXR-YYYY-XXXXXX format', () => {
    const id = createCaseId()
    expect(id).toMatch(/^LXR-\d{4}-\d{6}$/)
  })

  it('generates unique case IDs across 100 generations', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(createCaseId())
    }
    expect(ids.size).toBe(100)
  })

  it('generates 6-digit secure PIN within 100000-999999 range', () => {
    for (let i = 0; i < 50; i++) {
      const pin = generateSecurePin()
      expect(pin).toMatch(/^\d{6}$/)
      const num = parseInt(pin, 10)
      expect(num).toBeGreaterThanOrEqual(100000)
      expect(num).toBeLessThanOrEqual(999999)
    }
  })
})

describe('Auth & Registration Security (Regression Tests for AUD-001, AUD-016)', () => {
  it('validates registration schema and rejects weak passwords', () => {
    const valid = registerSchema.safeParse({
      name: 'Tester Lexora',
      email: 'tester@lexora.id',
      password: 'StrongPassword123!',
    })
    expect(valid.success).toBe(true)

    const weakPassword = registerSchema.safeParse({
      name: 'Tester',
      email: 'tester@lexora.id',
      password: 'short',
    })
    expect(weakPassword.success).toBe(false)

    const invalidEmail = registerSchema.safeParse({
      name: 'Tester',
      email: 'not-an-email',
      password: 'StrongPassword123!',
    })
    expect(invalidEmail.success).toBe(false)
  })
})
