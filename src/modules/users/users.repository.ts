import { db } from '@/lib/db'
import type { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const usersRepository = {
  async findById(id: string) {
    return db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        subscription: { select: { plan: true, status: true } },
      },
    })
  },

  async findByEmail(email: string) {
    return db.user.findUnique({ where: { email } })
  },

  async create(data: { name: string; email: string; password: string }) {
    const passwordHash = await bcrypt.hash(data.password, 12)
    return db.user.create({
      data: { name: data.name, email: data.email, passwordHash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
  },

  async updateProfile(id: string, data: { name?: string; image?: string }) {
    return db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, image: true, role: true },
    })
  },

  async updateRole(id: string, role: UserRole) {
    return db.user.update({ where: { id }, data: { role } })
  },

  async list(skip: number, take: number) {
    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      db.user.count(),
    ])
    return { users, total }
  },
}
