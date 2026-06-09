import { SendMessageResponse, HistoryResponse, ApiErrorResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as ApiErrorResponse;
      if (body.error) message = body.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

/** Sends a user message and returns the AI reply + sessionId */
export async function sendMessage(
  message: string,
  sessionId?: string,
): Promise<SendMessageResponse> {
  const res = await fetch(`${API_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });
  return handleResponse<SendMessageResponse>(res);
}

/** Loads previous messages for a given sessionId */
export async function fetchHistory(sessionId: string): Promise<HistoryResponse> {
  const res = await fetch(`${API_URL}/chat/history/${encodeURIComponent(sessionId)}`);
  return handleResponse<HistoryResponse>(res);
}
