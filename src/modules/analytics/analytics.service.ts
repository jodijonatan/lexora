import { analyticsRepository } from './analytics.repository'
import type { UserRole } from '@prisma/client'

export const analyticsService = {
  async getSummary(actorRole: UserRole) {
    const summary = await analyticsRepository.getSummary()
    // Non-admin users get the full summary but user metrics are omitted
    if (actorRole !== 'ADMIN') {
      const rest = { ...summary }
      delete (rest as Partial<typeof summary>).users
      return rest
    }
    return summary
  },

  async getRecentActivity(actorRole: UserRole, limit = 10) {
    if (actorRole !== 'ADMIN') return []
    return analyticsRepository.getRecentActivity(limit)
  },
}
