import { type NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { regulationsService } from '@/src/modules/regulations/regulations.service'
import { ValidationError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')
    if (!q || q.trim().length < 2) {
      throw new ValidationError('Parameter q minimal 2 karakter')
    }

    const results = await regulationsService.search(q)

    return ok(results, { total: results.length })
  } catch (err) {
    return handleError(err)
  }
}
