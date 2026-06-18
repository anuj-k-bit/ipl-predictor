// src/components/PredictButton.tsx
interface Props {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

// Bolt outline SVG
const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const PredictButton = ({ onClick, disabled, loading }: Props) => (
  <div className="card card-full">
    <button
      id="predict-btn"
      className="predict-btn"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>⏳ Predicting…</>
      ) : (
        <>
          <BoltIcon />
          Predict winner
        </>
      )}
    </button>
  </div>
);

export default PredictButton;
