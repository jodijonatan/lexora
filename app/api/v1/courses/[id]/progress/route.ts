import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { educationService } from '@/src/modules/education/education.service'
import { UnauthorizedError } from '@/lib/errors'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params
    const progress = await educationService.getCourseProgress(session.user.id, id)

    return ok(progress)
  } catch (err) {
    return handleError(err)
  }
}
