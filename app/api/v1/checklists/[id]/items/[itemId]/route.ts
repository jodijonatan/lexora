import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { checklistsService, updateItemSchema } from '@/src/modules/checklists/checklists.service'
import { UnauthorizedError } from '@/lib/errors'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id, itemId } = await params
    const body = await req.json()
    const input = updateItemSchema.parse(body)

    const updated = await checklistsService.updateItem(id, itemId, session.user.id, input)
    return ok(updated)
  } catch (err) {
    return handleError(err)
  }
}
