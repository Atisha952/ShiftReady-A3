import './StepperBar.css'

/**
 * StepperBar — progress-step indicator for the ShiftReady worker journey.
 * Adapted from the Origin UI Stepper component on 21st.dev
 * (https://21st.dev/origin-ui/stepper) to plain CSS with custom properties.
 *
 * Props:
 *   steps       — string[] of step labels
 *   currentStep — 0-based index of the active step
 */
function StepperBar({ steps, currentStep }) {
  return (
    <nav className="stepper-bar" aria-label="Progress">
      <ol className="stepper-list">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep

          return (
            <li
              key={label}
              className={
                'stepper-item' +
                (isCompleted ? ' stepper-item--completed' : '') +
                (isActive ? ' stepper-item--active' : '')
              }
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Connector line (not on first item) */}
              {index > 0 && (
                <span
                  className={
                    'stepper-connector' +
                    (isCompleted || isActive ? ' stepper-connector--filled' : '')
                  }
                  aria-hidden="true"
                />
              )}

              <span className="stepper-circle">
                {isCompleted ? '✓' : index + 1}
              </span>

              <span className="stepper-label">{label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default StepperBar