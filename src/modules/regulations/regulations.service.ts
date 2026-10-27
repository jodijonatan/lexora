import { regulationsRepository } from './regulations.repository'
import { NotFoundError, ForbiddenError } from '@/lib/errors'
import { z } from 'zod'
import type { ContentStatus, UserRole } from '@prisma/client'

export const createRegulationSchema = z.object({
  title: z.string().min(5).max(500),
  code: z.string().min(3).max(100),
  category: z.string().min(2).max(50),
  year: z.number().int().min(1945).max(new Date().getFullYear()),
  description: z.string().max(2000).optional(),
  sourceUrl: z.string().url().optional(),
})

const REVIEWER_ROLES: UserRole[] = ['ADMIN', 'LEGAL_REVIEWER']

export const regulationsService = {
  async list(opts: {
    skip: number
    take: number
    search?: string
    category?: string
    userRole?: UserRole
  }) {
    // Admin/reviewer bisa lihat semua status, publik hanya PUBLISHED
    const status: ContentStatus | undefined =
      opts.userRole && REVIEWER_ROLES.includes(opts.userRole) ? undefined : 'PUBLISHED'

    return regulationsRepository.findMany({ ...opts, status })
  },

  async getById(id: string) {
    const regulation = await regulationsRepository.findById(id)
    if (!regulation || regulation.status !== 'PUBLISHED') {
      throw new NotFoundError('Regulasi')
    }
    return regulation
  },

  async create(input: z.infer<typeof createRegulationSchema>, actorRole: UserRole) {
    if (!REVIEWER_ROLES.includes(actorRole)) throw new ForbiddenError()
    return regulationsRepository.create(input)
  },

  async publish(id: string, reviewerId: string, actorRole: UserRole) {
    if (!REVIEWER_ROLES.includes(actorRole)) throw new ForbiddenError()
    const regulation = await regulationsRepository.findById(id)
    if (!regulation) throw new NotFoundError('Regulasi')
    return regulationsRepository.updateStatus(id, 'PUBLISHED', reviewerId)
  },

  async search(query: string) {
    if (!query || query.trim().length < 2) return []
    return regulationsRepository.fullTextSearch(query.trim())
  },
}
