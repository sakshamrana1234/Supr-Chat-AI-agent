export function TypingIndicator() {
  return (
    <div className="msg-row msg-row--ai">
      <div className="msg-avatar" aria-hidden="true">
        SC
      </div>
      <div className="msg-bubble msg-bubble--ai typing-bubble" aria-label="Agent is typing">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
