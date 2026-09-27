import ScreenLayout from '../components/ScreenLayout'
import PrimaryButton from '../components/PrimaryButton'
import './ConfirmationScreen.css'

function ConfirmationScreen({ formData, onRestart, ...rest }) {
  return (
    <ScreenLayout title="Shift Plan Saved" {...rest}>
      <div className="confirm-icon">✓</div>
      <h2 className="confirm-heading">You're ShiftReady!</h2>
      <p className="confirm-message">
        Your shift plan for <strong>{formData.facility}</strong> on{' '}
        <strong>{formData.shiftDate}</strong> has been saved successfully.
      </p>
      <p className="confirm-sub">
        Have a great shift. Stay safe and travel well.
      </p>
      <PrimaryButton label="Start New Shift" onClick={onRestart} />
    </ScreenLayout>
  )
}

export default ConfirmationScreen
