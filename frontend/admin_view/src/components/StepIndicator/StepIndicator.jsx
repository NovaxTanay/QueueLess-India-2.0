// ============================================
// StepIndicator — Onboarding progress steps
// ============================================

import './StepIndicator.css';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div
            key={i}
            className={`step-item ${isActive ? 'step-active' : ''} ${isCompleted ? 'step-completed' : ''}`}
          >
            <div className="step-circle">
              {isCompleted ? '✓' : stepNum}
            </div>
            <span className="step-label">{step}</span>
            {i < steps.length - 1 && <div className="step-line" />}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
