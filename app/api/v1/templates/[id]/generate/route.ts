import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { created, handleError } from '@/lib/api-response'
import { templatesService, generateDocumentSchema } from '@/src/modules/templates/templates.service'
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
    const input = generateDocumentSchema.parse(body)

    const document = await templatesService.generate(id, session.user.id, input)
    return created(document)
  } catch (err) {
    return handleError(err)
  }
}
