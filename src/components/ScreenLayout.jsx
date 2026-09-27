import StepperBar from './StepperBar'
import './ScreenLayout.css'

function ScreenLayout({ title, children, showBack = false, onBack, steps, currentStepIndex }) {
  return (
    <div className="screen-layout">
      <header className="screen-header">
        {showBack && (
          <button type="button" className="back-button" onClick={onBack}>
            ← Back
          </button>
        )}
        <h1 className="screen-title">{title}</h1>
      </header>

      {steps && currentStepIndex >= 0 && (
        <StepperBar steps={steps} currentStep={currentStepIndex} />
      )}

      <main className="screen-body">
        {children}
      </main>
    </div>
  )
}

export default ScreenLayout
