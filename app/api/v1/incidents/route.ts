import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, created, handleError, parsePagination, buildMeta } from '@/lib/api-response'
import { incidentsService, createIncidentSchema } from '@/src/modules/incidents/incidents.service'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams)

    if (!session?.user?.id) {
      return ok([], buildMeta(0, page, limit))
    }

    const { incidents, total } = await incidentsService.list(session.user.id, skip, limit, session.user.role)

    return ok(incidents, buildMeta(total, page, limit))
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    let userId = session?.user?.id

    if (!userId) {
      // Izinkan pelaporan publik / anonim tersimpan ke database
      let publicUser = await db.user.findFirst({
        where: { email: 'publik@lexora.id' },
      })
      if (!publicUser) {
        publicUser = await db.user.create({
          data: {
            email: 'publik@lexora.id',
            name: 'Pelapor Publik (Anonim)',
            role: 'USER',
          },
        })
      }
      userId = publicUser.id
    }

    const body = await req.json()
    const input = createIncidentSchema.parse(body)
    const incident = await incidentsService.create(userId, input)

    return created(incident)
  } catch (err) {
    return handleError(err)
  }
}
