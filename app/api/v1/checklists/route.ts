import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, created, handleError, parsePagination, buildMeta } from '@/lib/api-response'
import { checklistsService, createChecklistSchema } from '@/src/modules/checklists/checklists.service'
import { UnauthorizedError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams)
    const { instances, total } = await checklistsService.listInstances(session.user.id, skip, limit)

    return ok(instances, buildMeta(total, page, limit))
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()
    const input = createChecklistSchema.parse(body)
    const instance = await checklistsService.createInstance(session.user.id, input)

    return created(instance)
  } catch (err) {
    return handleError(err)
  }
}
