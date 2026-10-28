import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { incidentsService } from '@/src/modules/incidents/incidents.service'
import { UnauthorizedError } from '@/lib/errors'
import { z } from 'zod'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params
    const incident = await incidentsService.getById(id, session.user.id, session.user.role)

    return ok(incident)
  } catch (err) {
    return handleError(err)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()
    const { status } = z
      .object({
        status: z.enum(['REPORTED', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED']),
      })
      .parse(body)

    const { id } = await params
    const incident = await incidentsService.updateStatus(id, session.user.id, status, session.user.role)

    return ok(incident)
  } catch (err) {
    return handleError(err)
  }
}
