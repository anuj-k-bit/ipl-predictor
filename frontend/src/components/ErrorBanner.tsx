// src/components/ErrorBanner.tsx
interface Props {
  message: string;
  onClose: () => void;
}

const ErrorBanner = ({ message, onClose }: Props) => (
  <div className="error-banner">
    <span className="error-icon">⚠️</span>
    <p className="error-text">{message}</p>
    <button className="error-close" onClick={onClose} aria-label="Dismiss">✕</button>
  </div>
);

export default ErrorBanner;
