import StepperBar from './StepperBar'
import './ScreenLayout.css'

function ScreenLayout({
  title,
  children,
  showBack = false,
  onBack,
  steps,
  currentStepIndex,
  onLogout,
}) {
  return (
    <div className="screen-layout">
      <header className="screen-header">
        {showBack && (
          <button type="button" className="back-button" onClick={onBack}>
            ← Back
          </button>
        )}
        <h1 className="screen-title">{title}</h1>
        {onLogout && (
          <button type="button" className="logout-button" onClick={onLogout}>
            Log out
          </button>
        )}
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
