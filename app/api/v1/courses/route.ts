import { type NextRequest } from 'next/server'
import { ok, handleError, parsePagination, buildMeta } from '@/lib/api-response'
import { educationService } from '@/src/modules/education/education.service'

export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams)
    const audience = req.nextUrl.searchParams.get('audience') ?? undefined

    const { courses, total } = await educationService.listCourses(skip, limit, audience)

    return ok(courses, buildMeta(total, page, limit))
  } catch (err) {
    return handleError(err)
  }
}
