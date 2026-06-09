export type Sender = 'user' | 'ai';

export interface MessageDTO {
  id: string;
  conversationId: string;
  sender: Sender;
  text: string;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: MessageDTO[];
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
}

export interface HistoryResponse {
  sessionId: string;
  messages: MessageDTO[];
}

export interface ApiError {
  error: string;
  details?: string;
}

// Shape used when building LLM context
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
