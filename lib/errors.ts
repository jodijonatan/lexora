export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'AI_ERROR'
  | 'OUT_OF_SCOPE'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Autentikasi diperlukan') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Akses ditolak') {
    super('FORBIDDEN', message, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} tidak ditemukan`, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Terlalu banyak permintaan. Coba lagi beberapa saat.') {
    super('RATE_LIMITED', message, 429)
    this.name = 'RateLimitError'
  }
}

export class AiError extends AppError {
  constructor(message = 'Layanan AI sedang tidak tersedia') {
    super('AI_ERROR', message, 503)
    this.name = 'AiError'
  }
}

export class OutOfScopeError extends AppError {
  constructor(message = 'Pertanyaan di luar lingkup hukum siber Indonesia') {
    super('OUT_OF_SCOPE', message, 422)
    this.name = 'OutOfScopeError'
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}
