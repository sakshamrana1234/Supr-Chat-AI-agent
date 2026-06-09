export type Sender = 'user' | 'ai';

export interface Message {
  id: string;
  conversationId: string;
  sender: Sender;
  text: string;
  createdAt: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
}

export interface HistoryResponse {
  sessionId: string;
  messages: Message[];
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
