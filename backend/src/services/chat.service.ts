import {
  createConversation,
  conversationExists,
  getMessagesByConversationId,
  saveMessage,
} from '../repositories/conversation.repository';
import { generateReply } from './llm.service';
import { SendMessageResponse, HistoryResponse } from '../lib/types';

// ---------------------------------------------------------------------------
// Chat service — orchestrates DB + LLM, no HTTP concerns here
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 1000;

/** Validates and trims a user message; throws on invalid input */
function validateMessage(message: unknown): string {
  if (typeof message !== 'string') {
    throw new ValidationError('Message must be a string.');
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    throw new ValidationError('Message cannot be empty.');
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError(
      `Message exceeds the ${MAX_MESSAGE_LENGTH}-character limit.`,
    );
  }

  return trimmed;
}

/**
 * Handles sending a user message:
 * 1. Validates input
 * 2. Creates or reuses a conversation
 * 3. Persists the user message
 * 4. Calls the LLM
 * 5. Persists the AI reply
 * 6. Returns the reply + sessionId
 */
export async function sendMessage(
  rawMessage: unknown,
  sessionId?: string,
): Promise<SendMessageResponse> {
  const userText = validateMessage(rawMessage);

  // Resolve conversation ID
  let conversationId = sessionId;

  if (conversationId) {
    const exists = await conversationExists(conversationId);
    if (!exists) {
      // Provided ID doesn't exist — start fresh (don't error; just create new)
      conversationId = await createConversation();
    }
  } else {
    conversationId = await createConversation();
  }

  // Fetch history BEFORE saving the new user message (so it's not included)
  const history = await getMessagesByConversationId(conversationId);

  // Persist user message
  await saveMessage(conversationId, 'user', userText);

  // Generate AI reply (may throw — caller handles it)
  const reply = await generateReply(history, userText);

  // Persist AI reply
  await saveMessage(conversationId, 'ai', reply);

  return { reply, sessionId: conversationId };
}

/**
 * Retrieves full message history for a conversation.
 * Returns empty messages array if conversationId not found.
 */
export async function getHistory(conversationId: string): Promise<HistoryResponse> {
  const exists = await conversationExists(conversationId);

  if (!exists) {
    return { sessionId: conversationId, messages: [] };
  }

  const messages = await getMessagesByConversationId(conversationId);
  return { sessionId: conversationId, messages };
}

// ---------------------------------------------------------------------------
// Custom error class for input validation
// ---------------------------------------------------------------------------
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
