import { Message } from '../types';

interface Props {
  message: Message;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Converts simple markdown-style bullet points and bold to HTML. */
function renderText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(?:-|\*) (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .split('\n')
    .map((line) => (line.startsWith('<') ? line : `<span>${line}</span>`))
    .join('\n');
}

export function MessageBubble({ message }: Props) {
  const isUser = message.sender === 'user';

  return (
    <div className={`msg-row ${isUser ? 'msg-row--user' : 'msg-row--ai'}`}>
      {!isUser && (
        <div className="msg-avatar" aria-hidden="true">
          AI
        </div>
      )}
      <div className={`msg-bubble ${isUser ? 'msg-bubble--user' : 'msg-bubble--ai'}`}>
        <div
          className="msg-text"
          dangerouslySetInnerHTML={{ __html: renderText(message.text) }}
        />
        <time className="msg-time">{formatTime(message.createdAt)}</time>
      </div>
    </div>
  );
}
