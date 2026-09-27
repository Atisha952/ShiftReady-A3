import { useState } from 'react'
import ScreenLayout from '../components/ScreenLayout'
import TextInput from '../components/TextInput'
import PrimaryButton from '../components/PrimaryButton'
import './TravelDetailsScreen.css'

function TravelDetailsScreen({ formData, updateField, onNext, onBack, ...rest }) {
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!formData.returnTravelTime || !formData.returnTravelCost) {
      setError('Please enter both return travel time and cost.')
      return
    }
    if (Number(formData.returnTravelTime) < 0 || Number(formData.returnTravelCost) < 0) {
      setError('Values cannot be negative.')
      return
    }
    setError('')
    onNext()
  }

  return (
    <ScreenLayout title="Travel Details" showBack={true} onBack={onBack} {...rest}>
      <p className="travel-desc">
        Enter the return travel time and cost for this shift.
      </p>

      {error && <p className="travel-error">{error}</p>}

      <TextInput
        label="Return Travel Time (hours)"
        value={formData.returnTravelTime}
        onChange={(val) => updateField('returnTravelTime', val)}
        type="number"
        placeholder="e.g. 1.5"
      />

      <TextInput
        label="Return Travel Cost ($)"
        value={formData.returnTravelCost}
        onChange={(val) => updateField('returnTravelCost', val)}
        type="number"
        placeholder="e.g. 12.00"
      />

      <PrimaryButton label="Calculate Shift Value" onClick={handleNext} />
    </ScreenLayout>
  )
}

export default TravelDetailsScreen
