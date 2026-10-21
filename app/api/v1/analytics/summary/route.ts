import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { analyticsService } from '@/src/modules/analytics/analytics.service'
import { UnauthorizedError } from '@/lib/errors'
import type { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const role = (session.user as { role?: UserRole }).role ?? 'USER'
    const summary = await analyticsService.getSummary(role)

    return ok(summary)
  } catch (err) {
    return handleError(err)
  }
}
