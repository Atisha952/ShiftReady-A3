import ScreenLayout from '../components/ScreenLayout'
import PrimaryButton from '../components/PrimaryButton'
import './ShiftValueScreen.css'

/* Helper: parse "HH:MM" time string to decimal hours */
function parseTimeToHours(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + minutes / 60
}

/* Helper: calculate shift hours, handling overnight shifts */
function calcShiftHours(startStr, endStr) {
  let start = parseTimeToHours(startStr)
  let end = parseTimeToHours(endStr)
  if (end <= start) {
    end += 24 // overnight shift
  }
  return end - start
}

function ShiftValueScreen({ formData, onNext, onBack, ...rest }) {
  const hourlyPay = Number(formData.hourlyPay)
  const returnTravelTime = Number(formData.returnTravelTime)   // in hours
  const returnTravelCost = Number(formData.returnTravelCost)

  const shiftHours = calcShiftHours(formData.shiftStart, formData.shiftEnd)
  const grossPay = hourlyPay * shiftHours
  const shiftValue = grossPay - returnTravelCost
  const effectiveHourly = shiftValue / (shiftHours + returnTravelTime)

  const fmt = (val) => '$' + val.toFixed(2)

  return (
    <ScreenLayout title="Shift Value" showBack={true} onBack={onBack} {...rest}>
      <p className="sv-desc">
        Here is the estimated value of your proposed shift.
      </p>

      <div className="sv-card">
        <span className="sv-card-label">Shift Hours</span>
        <span className="sv-card-value">{shiftHours.toFixed(1)} hrs</span>
      </div>

      <div className="sv-card">
        <span className="sv-card-label">Gross Shift Pay</span>
        <span className="sv-card-value">{fmt(grossPay)}</span>
      </div>

      <div className="sv-card">
        <span className="sv-card-label">Return Travel Cost</span>
        <span className="sv-card-value">−{fmt(returnTravelCost)}</span>
      </div>

      <div className="sv-card sv-card-highlight">
        <span className="sv-card-label">Estimated Shift Value (before tax)</span>
        <span className="sv-card-value">{fmt(shiftValue)}</span>
      </div>

      <div className="sv-card sv-card-highlight">
        <span className="sv-card-label">Effective Hourly Value</span>
        <span className="sv-card-value">{fmt(effectiveHourly)} / hr</span>
      </div>

      <p className="sv-note">
        Effective hourly value includes {returnTravelTime} hr return travel time
        in the total hours worked.
      </p>

      <PrimaryButton label="Continue to Checklist" onClick={onNext} />
    </ScreenLayout>
  )
}

export default ShiftValueScreen
