import NextAuth, { type DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from './db'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: UserRole } & DefaultSession['user']
  }
  interface JWT {
    id?: string
    role?: UserRole
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login', error: '/login' },

  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true, role: true, passwordHash: true },
        })
        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as typeof user & { role?: UserRole }).role ?? 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string | undefined) ?? ''
        session.user.role = (token.role as UserRole | undefined) ?? 'USER'
      }
      return session
    },
  },

  events: {
    async createUser({ user }) {
      if (user.id) {
        await db.subscription.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        })
      }
    },
  },
})

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    const { UnauthorizedError } = await import('./errors')
    throw new UnauthorizedError()
  }
  return session
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireAuth()
  if (!roles.includes(session.user.role)) {
    const { ForbiddenError } = await import('./errors')
    throw new ForbiddenError()
  }
  return session
}
