import { usersRepository } from './users.repository'
import { db } from '@/lib/db'
import { ConflictError, NotFoundError } from '@/lib/errors'
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().optional(),
})

export const usersService = {
  async register(input: z.infer<typeof registerSchema>) {
    const existing = await usersRepository.findByEmail(input.email)
    if (existing) throw new ConflictError('Email sudah terdaftar')

    const user = await usersRepository.create(input)

    await db.subscription.create({ data: { userId: user.id } })
    await db.auditLog.create({
      data: { userId: user.id, action: 'USER_REGISTERED', entityType: 'User', entityId: user.id },
    })

    return user
  },

  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId)
    if (!user) throw new NotFoundError('Pengguna')
    return user
  },

  async updateProfile(userId: string, input: z.infer<typeof updateProfileSchema>) {
    const user = await usersRepository.findById(userId)
    if (!user) throw new NotFoundError('Pengguna')

    return usersRepository.updateProfile(userId, input)
  },

  async listUsers(skip: number, take: number) {
    return usersRepository.list(skip, take)
  },
}
