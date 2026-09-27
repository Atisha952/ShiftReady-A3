import { useState } from 'react'
import ScreenLayout from '../components/ScreenLayout'
import TextInput from '../components/TextInput'
import PrimaryButton from '../components/PrimaryButton'
import './ShiftDetailsScreen.css'

function ShiftDetailsScreen({ formData, updateField, onNext, onBack, ...rest }) {
  const [error, setError] = useState('')

  const handleNext = () => {
    const { facility, shiftDate, shiftStart, shiftEnd, hourlyPay } = formData
    if (!facility || !shiftDate || !shiftStart || !shiftEnd || !hourlyPay) {
      setError('Please fill in all shift details.')
      return
    }
    if (Number(hourlyPay) <= 0) {
      setError('Hourly pay must be greater than 0.')
      return
    }
    setError('')
    onNext()
  }

  return (
    <ScreenLayout title="Shift Details" showBack={true} onBack={onBack} {...rest}>
      <p className="shift-desc">Enter details for the proposed shift.</p>

      {error && <p className="shift-error">{error}</p>}

      <TextInput
        label="Facility / Location"
        value={formData.facility}
        onChange={(val) => updateField('facility', val)}
        placeholder="e.g. Sunshine Aged Care"
      />

      <TextInput
        label="Shift Date"
        value={formData.shiftDate}
        onChange={(val) => updateField('shiftDate', val)}
        type="date"
      />

      <TextInput
        label="Shift Start Time"
        value={formData.shiftStart}
        onChange={(val) => updateField('shiftStart', val)}
        type="time"
      />

      <TextInput
        label="Shift End Time"
        value={formData.shiftEnd}
        onChange={(val) => updateField('shiftEnd', val)}
        type="time"
      />

      <TextInput
        label="Hourly Pay ($)"
        value={formData.hourlyPay}
        onChange={(val) => updateField('hourlyPay', val)}
        type="number"
        placeholder="e.g. 38.50"
      />

      <PrimaryButton label="Next" onClick={handleNext} />
    </ScreenLayout>
  )
}

export default ShiftDetailsScreen
