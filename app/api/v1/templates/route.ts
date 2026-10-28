import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError, parsePagination, buildMeta } from '@/lib/api-response'
import { templatesService } from '@/src/modules/templates/templates.service'
import { UnauthorizedError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams)
    const { templates, total } = await templatesService.list(skip, limit)

    return ok(templates, buildMeta(total, page, limit))
  } catch (err) {
    return handleError(err)
  }
}
