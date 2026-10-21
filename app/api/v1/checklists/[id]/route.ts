import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { checklistsService } from '@/src/modules/checklists/checklists.service'
import { UnauthorizedError } from '@/lib/errors'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params
    const instance = await checklistsService.getInstance(id, session.user.id)

    return ok(instance)
  } catch (err) {
    return handleError(err)
  }
}
