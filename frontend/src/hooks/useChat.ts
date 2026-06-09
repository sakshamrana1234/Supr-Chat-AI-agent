import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { sendMessage as apiSendMessage, fetchHistory } from '../utils/api';

const SESSION_KEY = 'swiftcart_session_id';

interface UseChatReturn {
  messages: Message[];
  sessionId: string | null;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  clearError: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount: load history if we have a saved session
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return;

    setSessionId(saved);
    setIsLoadingHistory(true);

    fetchHistory(saved)
      .then((data) => {
        if (data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch(() => {
        // If history fails, we just start fresh — don't error the user
        localStorage.removeItem(SESSION_KEY);
        setSessionId(null);
      })
      .finally(() => setIsLoadingHistory(false));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // Optimistically add user message to UI
      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId: sessionId ?? '',
        sender: 'user',
        text: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempUserMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiSendMessage(trimmed, sessionId ?? undefined);

        // Save sessionId for future page loads
        if (!sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem(SESSION_KEY, data.sessionId);
        }

        // Update the temp user message with real conversation ID, then add AI reply
        setMessages((prev) =>
          prev
            .map((m) =>
              m.id === tempUserMsg.id
                ? { ...m, conversationId: data.sessionId }
                : m,
            )
            .concat({
              id: `ai-${Date.now()}`,
              conversationId: data.sessionId,
              sender: 'ai',
              text: data.reply,
              createdAt: new Date().toISOString(),
            }),
        );
      } catch (err) {
        // Remove optimistic user message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading],
  );

  return {
    messages,
    sessionId,
    isLoading,
    isLoadingHistory,
    error,
    send,
    clearError: () => setError(null),
  };
}
