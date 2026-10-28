import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { analyticsService } from '@/src/modules/analytics/analytics.service'
import { UnauthorizedError } from '@/lib/errors'
import type { UserRole } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const role = (session.user as { role?: UserRole }).role ?? 'USER'
    const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10))
    const activity = await analyticsService.getRecentActivity(role, limit)

    return ok(activity)
  } catch (err) {
    return handleError(err)
  }
}
