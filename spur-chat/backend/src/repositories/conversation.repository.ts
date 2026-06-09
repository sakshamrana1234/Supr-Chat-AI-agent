import { prisma } from '../lib/prisma';
import { Sender } from '@prisma/client';
import { MessageDTO } from '../lib/types';

// ---------------------------------------------------------------------------
// Conversation repository — all DB access goes through here
// ---------------------------------------------------------------------------

/** Creates a new conversation and returns its id */
export async function createConversation(): Promise<string> {
  const conversation = await prisma.conversation.create({ data: {} });
  return conversation.id;
}

/** Returns true if a conversation with the given id exists */
export async function conversationExists(id: string): Promise<boolean> {
  const count = await prisma.conversation.count({ where: { id } });
  return count > 0;
}

/** Fetches all messages for a conversation, ordered by creation time */
export async function getMessagesByConversationId(
  conversationId: string,
): Promise<MessageDTO[]> {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    sender: m.sender === Sender.user ? 'user' : 'ai',
    text: m.text,
    createdAt: m.createdAt.toISOString(),
  }));
}

/** Persists a single message and returns it as a DTO */
export async function saveMessage(
  conversationId: string,
  sender: 'user' | 'ai',
  text: string,
): Promise<MessageDTO> {
  const message = await prisma.message.create({
    data: {
      conversationId,
      sender: sender === 'user' ? Sender.user : Sender.ai,
      text,
    },
  });

  return {
    id: message.id,
    conversationId: message.conversationId,
    sender,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
  };
}
