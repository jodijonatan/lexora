import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { isAppError } from './errors'

export interface SuccessResponse<T> {
  data: T
  meta?: ResponseMeta
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface ResponseMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export function ok<T>(data: T, meta?: ResponseMeta, status = 200): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status })
}

export function created<T>(data: T): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ data }, { status: 201 })
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status },
  )
}

export function handleError(err: unknown): NextResponse<ErrorResponse> {
  if (isAppError(err)) {
    return errorResponse(err.code, err.message, err.statusCode, err.details)
  }

  if (err instanceof ZodError) {
    return errorResponse('VALIDATION_ERROR', 'Data yang dikirim tidak valid', 400, err.flatten().fieldErrors)
  }

  // Prisma P2002: unique constraint violation
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
    return errorResponse('CONFLICT', 'Data sudah ada', 409)
  }

  // Prisma P2025: record not found
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025') {
    return errorResponse('NOT_FOUND', 'Data tidak ditemukan', 404)
  }

  console.error('[Lexora] Unhandled error:', err)
  return errorResponse('INTERNAL_ERROR', 'Terjadi kesalahan pada server', 500)
}

export function buildMeta(total: number, page: number, limit: number): ResponseMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) }
}

export function parsePagination(searchParams: URLSearchParams): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  return { page, limit, skip: (page - 1) * limit }
}
