import { analyticsRepository } from './analytics.repository'
import { ForbiddenError } from '@/lib/errors'
import type { UserRole } from '@prisma/client'

const ADMIN_ROLES: UserRole[] = ['ADMIN']

export const analyticsService = {
  async getSummary(actorRole: UserRole) {
    if (!ADMIN_ROLES.includes(actorRole)) throw new ForbiddenError()
    return analyticsRepository.getSummary()
  },

  async getRecentActivity(actorRole: UserRole, limit = 10) {
    if (!ADMIN_ROLES.includes(actorRole)) throw new ForbiddenError()
    return analyticsRepository.getRecentActivity(limit)
  },
}
