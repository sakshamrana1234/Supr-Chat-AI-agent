interface Props {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-icon">!</span>
      <p className="error-text">{message}</p>
      <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
        x
      </button>
    </div>
  );
}
