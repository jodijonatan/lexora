import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  try {
    await db.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - start

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '0.1.0',
        services: {
          database: { status: 'ok', latencyMs: dbLatency },
          api: { status: 'ok' },
        },
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'error' },
          api: { status: 'ok' },
        },
      },
      { status: 503 },
    )
  }
}
