import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Prisma evaluates this config before loading .env, so we load it manually here
config({ path: '.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lexora?sslmode=disable',
    shadowDatabaseUrl: undefined,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
})
