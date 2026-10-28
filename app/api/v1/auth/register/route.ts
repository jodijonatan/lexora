import { type NextRequest } from 'next/server'
import { created, handleError } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { usersService, registerSchema } from '@/src/modules/users/users.service'

export async function POST(req: NextRequest) {
  try {
    const { limited, headers } = await checkRateLimit(req, 'auth')
    if (limited) {
      return Response.json(
        { error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Coba lagi nanti.' } },
        { status: 429, headers },
      )
    }

    const body = await req.json()
    const input = registerSchema.parse(body)
    const user = await usersService.register(input)

    return created(user)
  } catch (err) {
    return handleError(err)
  }
}
