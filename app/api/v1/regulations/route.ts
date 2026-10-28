import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, created, handleError, parsePagination, buildMeta } from '@/lib/api-response'
import { regulationsService, createRegulationSchema } from '@/src/modules/regulations/regulations.service'
import type { UserRole } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userRole = (session?.user as { role?: UserRole } | undefined)?.role

    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams)
    const search = req.nextUrl.searchParams.get('q') ?? undefined
    const category = req.nextUrl.searchParams.get('category') ?? undefined

    const { regulations, total } = await regulationsService.list({
      skip,
      take: limit,
      search,
      category,
      userRole,
    })

    return ok(regulations, buildMeta(total, page, limit))
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan' } },
        { status: 401 },
      )
    }

    const body = await req.json()
    const input = createRegulationSchema.parse(body)
    const role = (session.user as { role?: UserRole }).role ?? 'USER'

    const regulation = await regulationsService.create(input, role)
    return created(regulation)
  } catch (err) {
    return handleError(err)
  }
}
