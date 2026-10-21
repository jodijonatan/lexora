import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-response'
import { usersService, updateProfileSchema } from '@/src/modules/users/users.service'
import { UnauthorizedError } from '@/lib/errors'

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const profile = await usersService.getProfile(session.user.id)
    return ok(profile)
  } catch (err) {
    return handleError(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()
    const input = updateProfileSchema.parse(body)
    const profile = await usersService.updateProfile(session.user.id, input)

    return ok(profile)
  } catch (err) {
    return handleError(err)
  }
}
