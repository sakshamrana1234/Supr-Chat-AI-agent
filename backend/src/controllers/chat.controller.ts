import { Request, Response, NextFunction } from 'express';
import { sendMessage, getHistory, ValidationError } from '../services/chat.service';
import { ApiError } from '../lib/types';

// ---------------------------------------------------------------------------
// Chat controller — translates HTTP ↔ service layer
// ---------------------------------------------------------------------------

export async function handleSendMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { message, sessionId } = req.body as {
      message: unknown;
      sessionId?: string;
    };

    const result = await sendMessage(message, sessionId);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof ValidationError) {
      const body: ApiError = { error: err.message };
      res.status(400).json(body);
      return;
    }
    // Pass unexpected errors to the global handler
    next(err);
  }
}

export async function handleGetHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      res.status(400).json({ error: 'sessionId is required.' } satisfies ApiError);
      return;
    }

    const result = await getHistory(sessionId.trim());
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
