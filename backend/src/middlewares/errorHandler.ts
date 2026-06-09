import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../lib/types';

// ---------------------------------------------------------------------------
// Global error handler — last middleware in the chain
// ---------------------------------------------------------------------------
export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[Error]', err);

  // OpenAI API errors (status codes from the SDK)
  if (isOpenAIError(err)) {
    const status = err.status ?? 500;
    let message = 'The AI service encountered an issue. Please try again.';

    if (status === 401) message = 'AI service authentication failed. Contact support.';
    else if (status === 429) message = 'AI service is busy right now. Please wait a moment and retry.';
    else if (status === 503) message = 'AI service is temporarily unavailable. Please try again shortly.';

    res.status(502).json({ error: message } satisfies ApiError);
    return;
  }

  // Generic known error
  if (err instanceof Error) {
    if (err.message.includes('OPENAI_API_KEY')) {
      res.status(500).json({
        error: 'Server configuration error. Please contact support.',
      } satisfies ApiError);
      return;
    }

    // Timeout
    if (err.message.toLowerCase().includes('timeout')) {
      res.status(504).json({
        error: 'The request timed out. Please try again.',
      } satisfies ApiError);
      return;
    }
  }

  // Fallback
  res.status(500).json({
    error: 'Something went wrong on our end. Please try again.',
  } satisfies ApiError);
};

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found.' } satisfies ApiError);
};

// ---------------------------------------------------------------------------
// Type guard for OpenAI SDK errors
// ---------------------------------------------------------------------------
function isOpenAIError(err: unknown): err is { status?: number; message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    ('status' in err || 'error' in err)
  );
}
