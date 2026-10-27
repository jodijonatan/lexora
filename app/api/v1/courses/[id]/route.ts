import { type NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { educationService } from '@/src/modules/education/education.service'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const course = await educationService.getCourse(id)
    return ok(course)
  } catch (err) {
    return handleError(err)
  }
}
