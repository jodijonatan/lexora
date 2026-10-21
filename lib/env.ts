import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL harus berupa URL yang valid'),
  DIRECT_URL: z.string().url('DIRECT_URL harus berupa URL yang valid').optional(),

  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET minimal 32 karakter'),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  LLM_API_KEY: z.string().optional(),
  EMBEDDING_API_KEY: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const messages = Object.entries(errors)
      .map(([key, msgs]) => `  - ${key}: ${msgs?.join(', ')}`)
      .join('\n')
    throw new Error(`❌ Environment variables tidak valid:\n${messages}`)
  }
  return parsed.data
}

let _env: Env | undefined

export function getEnv(): Env {
  if (!_env) _env = validateEnv()
  return _env
}

export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return getEnv()[prop as keyof Env]
  },
})
