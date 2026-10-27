import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { created, handleError } from '@/lib/api-response'
import { incidentsService, createReminderSchema } from '@/src/modules/incidents/incidents.service'
import { UnauthorizedError } from '@/lib/errors'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params
    const body = await req.json()
    const input = createReminderSchema.parse(body)
    const reminder = await incidentsService.addReminder(id, session.user.id, input)

    return created(reminder)
  } catch (err) {
    return handleError(err)
  }
}
