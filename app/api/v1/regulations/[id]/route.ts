import { type NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { regulationsService } from '@/src/modules/regulations/regulations.service'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const regulation = await regulationsService.getById(id)
    return ok(regulation)
  } catch (err) {
    return handleError(err)
  }
}
