import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ErrorBanner } from './ErrorBanner';

const SUGGESTED_QUESTIONS = [
  'Track my latest order',
  'Help me return an item',
  'Explain payment options',
  'Can I cancel my order?',
];

export function ChatWidget() {
  const { messages, isLoading, isLoadingHistory, error, send, clearError } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    await send(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0 && !isLoadingHistory;

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="chat-header-avatar">AI</div>
        <div className="chat-header-info">
          <h1 className="chat-header-name">SwiftCart Support</h1>
          <p className="chat-header-status">
            <span className="status-dot" />
            Online - Mon-Sat, 10 AM-7 PM IST
          </p>
        </div>
        <span className="chat-header-badge">Beta</span>
      </div>

      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {isLoadingHistory && (
          <div className="loading-history">Loading conversation...</div>
        )}

        {isEmpty && !isLoadingHistory && (
          <div className="chat-empty">
            <div className="chat-empty-icon">AI</div>
            <p className="chat-empty-title">How can I help today?</p>
            <p className="chat-empty-sub">
              Ask about shipping, returns, payments, cancellations, or anything
              you need before placing an order.
            </p>
            <div className="suggestions">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  className="suggestion-btn"
                  onClick={() => handleSuggestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <form className="chat-form" onSubmit={handleSubmit} noValidate>
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            maxLength={1000}
            rows={1}
            disabled={isLoading}
            aria-label="Message input"
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={isLoading || input.trim().length === 0}
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="send-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>
        <p className="chat-footer">
          Powered by SwiftCart AI - {input.length}/1000
        </p>
      </div>
    </div>
  );
}
