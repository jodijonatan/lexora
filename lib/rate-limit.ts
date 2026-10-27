import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

function createRedis() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return null
}

const redis = createRedis()

/** Sliding window limiter. Falls back to a no-op limiter when Redis is not configured. */
function makeLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  if (!redis) {
    return {
      limit: async () => ({ success: true, limit: requests, remaining: requests, reset: 0 }),
    }
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  })
}

export const limiters = {
  chat: makeLimiter(20, '1 m'),
  auth: makeLimiter(30, '1 m'),
  default: makeLimiter(100, '1 m'),
}

export type LimiterKey = keyof typeof limiters

export function getIdentifier(req: NextRequest, userId?: string): string {
  if (userId) return `user_${userId}`
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
  return `ip_${ip}`
}

export async function checkRateLimit(
  req: NextRequest,
  limiterKey: LimiterKey = 'default',
  userId?: string,
): Promise<{ limited: boolean; headers: Record<string, string> }> {
  const identifier = getIdentifier(req, userId)
  const result = await limiters[limiterKey].limit(identifier)

  return {
    limited: !result.success,
    headers: {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.reset),
    },
  }
}
