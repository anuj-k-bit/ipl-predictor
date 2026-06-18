// src/components/LoadingSpinner.tsx
const LoadingSpinner = () => (
  <div className="spinner-overlay">
    <div className="spinner" />
    <p className="spinner-text">Predicting outcome…</p>
  </div>
);

export default LoadingSpinner;
