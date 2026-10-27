import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, created, handleError, parsePagination, buildMeta } from '@/lib/api-response'
import { incidentsService, createIncidentSchema } from '@/src/modules/incidents/incidents.service'
import { UnauthorizedError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams)
    const { incidents, total } = await incidentsService.list(session.user.id, skip, limit, session.user.role)

    return ok(incidents, buildMeta(total, page, limit))
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()
    const input = createIncidentSchema.parse(body)
    const incident = await incidentsService.create(session.user.id, input)

    return created(incident)
  } catch (err) {
    return handleError(err)
  }
}
