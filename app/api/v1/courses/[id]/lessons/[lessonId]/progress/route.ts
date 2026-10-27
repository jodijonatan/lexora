import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { educationService, updateProgressSchema } from '@/src/modules/education/education.service'
import { UnauthorizedError } from '@/lib/errors'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { lessonId } = await params
    const body = await req.json()
    const input = updateProgressSchema.parse(body)

    const progress = await educationService.updateProgress(session.user.id, lessonId, input)
    return ok(progress)
  } catch (err) {
    return handleError(err)
  }
}
