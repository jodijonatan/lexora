import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { templatesService } from '@/src/modules/templates/templates.service'
import { UnauthorizedError } from '@/lib/errors'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params
    const template = await templatesService.getById(id)

    return ok(template)
  } catch (err) {
    return handleError(err)
  }
}
