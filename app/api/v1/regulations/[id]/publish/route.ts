import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { regulationsService } from '@/src/modules/regulations/regulations.service'
import { UnauthorizedError } from '@/lib/errors'
import type { UserRole } from '@prisma/client'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params
    const role = (session.user as { role?: UserRole }).role ?? 'USER'

    const regulation = await regulationsService.publish(id, session.user.id, role)
    return ok(regulation)
  } catch (err) {
    return handleError(err)
  }
}
